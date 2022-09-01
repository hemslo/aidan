import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteIcon from '@mui/icons-material/Delete';
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import { Snapshot } from "../camera/Camera";
import { collection, query, orderBy, limit, deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useFirestore, useFirestoreCollectionData, useSigninCheck, useStorage, useStorageDownloadURL } from "reactfire";
import { useCallback, useState } from "react";

const DownloadImage = ({ snapshot }: { snapshot: Snapshot }) => {
    const storage = useStorage();
    const snapshotRef = ref(storage, snapshot.imageGcsUri);
    const { status, data: imageURL } = useStorageDownloadURL(snapshotRef);
    if (status === 'loading') {
        return <CircularProgress />;
    }
    return <img src={imageURL} alt={snapshot.id} width="100%" loading="lazy" />;
}

const SnapshotImage = ({
    snapshot,
    deleteSnapshot,
    canEdit }: {
        snapshot: Snapshot,
        deleteSnapshot: (snapshot: Snapshot) => Promise<void>,
        canEdit: boolean,
    }) => {
    const [disableDelete, setDisableDelete] = useState(false);
    const handleDeleteSnapshot = useCallback(async () => {
        setDisableDelete(true);
        await deleteSnapshot(snapshot)
    }, [deleteSnapshot, snapshot]);
    return (
        <>
            {disableDelete ? <CircularProgress /> : <DownloadImage snapshot={snapshot} />}
            <ImageListItemBar
                title={snapshot.id}
                position="below"
            />
            {canEdit && <Button
                startIcon={<DeleteIcon />}
                onClick={handleDeleteSnapshot}
                disabled={disableDelete}
            >
                Delete
            </Button>}
        </>);
}

export const Dashboard = () => {
    const firestore = useFirestore();
    const storage = useStorage();
    const snapshotsCollection = collection(firestore, 'snapshots');
    const snapshotsQuery = query(snapshotsCollection, orderBy('id', 'desc'), limit(10));
    const deleteSnapshot = useCallback(async (snapshot: Snapshot) => {
        await deleteObject(ref(storage, snapshot.imageGcsUri));
        await deleteDoc(doc(snapshotsCollection, snapshot.id))
    }, [snapshotsCollection, storage]);
    const { status, data: snapshots } = useFirestoreCollectionData(snapshotsQuery, { idField: 'id' });
    const { data: signInCheckResult } = useSigninCheck({ requiredClaims: { admin: 'true' } });

    if (status === "loading") {
        return <CircularProgress />
    }
    return (<ImageList>
        {snapshots.map(snapshot => (
            <ImageListItem key={snapshot.id}>
                <SnapshotImage
                    snapshot={snapshot as Snapshot}
                    deleteSnapshot={() => deleteSnapshot(snapshot as Snapshot)}
                    canEdit={signInCheckResult.signedIn && signInCheckResult.hasRequiredClaims}
                />
            </ImageListItem>))}
    </ImageList>);
};
