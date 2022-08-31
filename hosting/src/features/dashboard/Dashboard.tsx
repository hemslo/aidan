import CircularProgress from "@mui/material/CircularProgress";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import { Snapshot } from "../camera/Camera";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { ref } from "firebase/storage";
import { useFirestore, useFirestoreCollectionData, useStorage, useStorageDownloadURL } from "reactfire";

const SnapshotImage = ({ snapshot }: { snapshot: Snapshot }) => {
    const storage = useStorage();
    const snapshotRef = ref(storage, snapshot.imageGcsUri);
    const { status, data: imageURL } = useStorageDownloadURL(snapshotRef);
    if (status === 'loading') {
        return <CircularProgress />;
    }
    return (
        <>
            <img src={imageURL} alt={snapshot.id} width="100%" loading="lazy" />
            <ImageListItemBar
                title={snapshot.id}
                position="below"
            />
        </>);
}

export const Dashboard = () => {
    const firestore = useFirestore();
    const snapshotsCollection = collection(firestore, 'snapshots');
    const snapshotsQuery = query(snapshotsCollection, orderBy('id', 'desc'), limit(10));
    const { status, data: snapshots } = useFirestoreCollectionData(snapshotsQuery);

    if (status === "loading") {
        return <CircularProgress />
    }
    return (<ImageList cols={4}>
        {snapshots.map(snapshot => (
            <ImageListItem key={snapshot.id}>
                <SnapshotImage snapshot={snapshot as Snapshot} />
            </ImageListItem>))}
    </ImageList>);
};
