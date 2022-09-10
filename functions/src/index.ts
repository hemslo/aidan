import {ImageClassificationModel} from "@tensorflow/tfjs-automl";
import {basename, join} from "path";
import {debug, log} from "firebase-functions/logger";
import {getFirestore} from "firebase-admin/firestore";
import {getStorage} from "firebase-admin/storage";
import {initializeApp} from "firebase-admin/app";
import {onObjectFinalized, StorageEvent} from "firebase-functions/v2/storage";
import {pathToFileURL} from "url";
import {tmpdir} from "os";
import {promises as fs} from "fs";
import {loadGraphModel, node, Tensor3D} from "@tensorflow/tfjs-node";

initializeApp();

let imageClassificationModel: ImageClassificationModel | undefined;

const waitForDoc = (doc: FirebaseFirestore.DocumentReference) =>
  new Promise<FirebaseFirestore.DocumentSnapshot<
    FirebaseFirestore.DocumentData>>(
        (r) => {
          debug("Waiting for doc to be created...");
          const unsubscribe = doc.onSnapshot((snapshot) => {
            if (snapshot.exists) {
              r(snapshot);
              unsubscribe();
            }
          });
        });

const downloadModel = async (bucket: string) => {
  const bucketRef = getStorage().bucket(bucket);
  const [files] = await bucketRef.getFiles({prefix: process.env.MODEL_PATH});
  await Promise.all(files.map((file) => {
    const destination = join(tmpdir(), basename(file.name));
    debug(`Downloading model ${destination}`);
    return file.download({destination});
  }));
};

const loadDictionary = async () => {
  const text = await fs.readFile(join(tmpdir(), "dict.txt"), "utf8");
  return text.trim().split("\n");
};

const loadImageClassification = async (bucket: string) => {
  if (imageClassificationModel) {
    debug("Image classification model already loaded");
    return imageClassificationModel;
  }

  await downloadModel(bucket);

  const [model, dict] = await Promise.all([
    loadGraphModel(pathToFileURL(join(tmpdir(), "model.json")).href),
    loadDictionary(),
  ]);
  debug("Loaded model and dictionary");

  imageClassificationModel = new ImageClassificationModel(model, dict);
  return imageClassificationModel;
};

const predictLabel = async (
    image: Tensor3D,
    model: ImageClassificationModel,
) => {
  const predictions = await model.classify(image);
  debug("Predictions", predictions);
  return predictions.sort((a, b) => b.prob - a.prob)[0];
};

const savePrediction = async (
    id: string,
    prediction: string,
    score: number,
) => {
  const snapshotsCollection = getFirestore().collection("snapshots");
  const docRef = snapshotsCollection.doc(id);

  const doc = await waitForDoc(docRef);
  debug("Document data", doc.data());

  await docRef.set({
    prediction,
    score,
  }, {merge: true});
};

const prepareImage = async (bucket: string, name: string) => {
  const [image] = await getStorage().bucket(bucket).file(name!).download();
  debug("Image downloaded", name);
  return node.decodeImage(Uint8Array.from(image)) as Tensor3D;
};

export const predict = onObjectFinalized(
    {
      region: "us-west1",
    },
    async (event: StorageEvent) => {
      const {bucket, name, contentType} = event.data;

      if (!contentType?.startsWith("image/")) {
        log("This is not an image.");
        return;
      }

      const [image, model] = await Promise.all([
        prepareImage(bucket!, name!),
        loadImageClassification(bucket!),
      ]);

      const result = await predictLabel(image, model);
      if (!result) {
        return;
      }
      log(`Prediction result for ${name}`, result);

      await savePrediction(
          basename(name!),
          result.label,
          result.prob,
      );
      log("Prediction saved", name);
    });
