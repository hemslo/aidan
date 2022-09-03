import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from "@mui/material/Divider";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import TextField from "@mui/material/TextField";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Snapshot } from "../camera/Camera";
import { collection, query, orderBy, limit, deleteDoc, doc, where } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useCallback, useState } from "react";
import { useFirestore, useFirestoreCollectionData, useSigninCheck, useStorage, useStorageDownloadURL } from "reactfire";

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
    const [fromDateTime, setFromDateTime] = useState<Date | null>(null);
    const [toDateTime, setToDateTime] = useState<Date | null>(null);

    const snapshotsCollection = collection(firestore, 'snapshots');

    const conditions = [];
    if (fromDateTime) {
        conditions.push(where('id', '>=', fromDateTime.toISOString()));
    }
    if (toDateTime) {
        conditions.push(where('id', '<', toDateTime.toISOString()));
    }
    const snapshotsQuery = query(
        snapshotsCollection,
        ...conditions,
        orderBy('id', 'desc'),
        limit(10));

    const deleteSnapshot = useCallback(async (snapshot: Snapshot) => {
        await deleteObject(ref(storage, snapshot.imageGcsUri));
        await deleteDoc(doc(snapshotsCollection, snapshot.id))
    }, [snapshotsCollection, storage]);
    const { status, data: snapshots } = useFirestoreCollectionData(snapshotsQuery, { idField: 'id' });
    const { data: signInCheckResult } = useSigninCheck({ requiredClaims: { write: 'true' } });

    if (status === "loading") {
        return <CircularProgress />
    }
    return (
        <Box>
            <Container sx={{display: 'flex', justifyContent: 'center'}}>
                <DateTimePicker
                    renderInput={(props) => <TextField {...props} />}
                    label="From"
                    value={fromDateTime}
                    onChange={setFromDateTime}
                />
                <Divider orientation="vertical" flexItem>-</Divider>
                <DateTimePicker
                    renderInput={(props) => <TextField {...props} />}
                    label="To"
                    value={toDateTime}
                    onChange={setToDateTime}
                />
            </Container>

            <ImageList>
                {snapshots.map(snapshot => (
                    <ImageListItem key={snapshot.id}>
                        <SnapshotImage
                            snapshot={snapshot as Snapshot}
                            deleteSnapshot={() => deleteSnapshot(snapshot as Snapshot)}
                            canEdit={signInCheckResult.signedIn && signInCheckResult.hasRequiredClaims}
                        />
                    </ImageListItem>))}
            </ImageList>
        </Box>
    );
};
