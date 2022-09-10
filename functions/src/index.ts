import {basename} from "path";
import {getFirestore} from "firebase-admin/firestore";
import {getStorage} from "firebase-admin/storage";
import {initializeApp} from "firebase-admin/app";
import {log} from "firebase-functions/logger";
import {onObjectFinalized, StorageEvent} from "firebase-functions/v2/storage";
import {v1beta1} from "@google-cloud/automl";

initializeApp();

const waitForDoc = (doc: FirebaseFirestore.DocumentReference) =>
  new Promise<FirebaseFirestore.DocumentSnapshot<
    FirebaseFirestore.DocumentData>>(
        (r) => {
          log("Waiting for doc to be created...");
          const unsubscribe = doc.onSnapshot((snapshot) => {
            if (snapshot.exists) {
              r(snapshot);
              unsubscribe();
            }
          });
        });

const download = async (bucket: string, name: string) => {
  const [image] = await getStorage().bucket(bucket).file(name!).download();
  return image;
};

const predictLabel = async (image: Buffer) => {
  const client = new v1beta1.PredictionServiceClient();
  const [response] = await client.predict({
    name: client.modelPath(
        process.env.PROJECT_ID!,
        process.env.LOCATION!,
        process.env.MODEL_ID!,
    ),
    payload: {
      image: {
        imageBytes: image.toString("base64"),
      },
    },
  });
  log("Prediction response", response);
  const result = response.payload?.sort(
      (a, b) => b.classification!.score! - a.classification!.score!,
  )[0];
  return result;
};

const savePrediction = async (
    id: string,
    prediction: string,
    score: number,
) => {
  const snapshotsCollection = getFirestore().collection("snapshots");
  const docRef = snapshotsCollection.doc(id);

  const doc = await waitForDoc(docRef);
  log("Document data", doc.data());

  await docRef.set({
    prediction,
    score,
  }, {merge: true});
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

      const image = await download(bucket!, name!);
      log("Image downloaded", name);

      const result = await predictLabel(image);
      if (!result) {
        return;
      }
      log(`Prediction result for ${name}`, result);

      await savePrediction(
          basename(name!),
         result.displayName!,
         result.classification!.score!,
      );
      log("Prediction saved", name);
    });
