import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from "@mui/material/Divider";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Snapshot } from "../camera/Camera";
import { collection, query, orderBy, limit, deleteDoc, doc, where, addDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useCallback, useMemo, useState } from "react";
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

const Labels = () => {
    const firestore = useFirestore();
    const labelsCollection = useMemo(() => collection(firestore, 'labels'), [firestore]);
    const labelsQuery = useMemo(() => query(labelsCollection), [labelsCollection]);

    const { status, data: labels } = useFirestoreCollectionData(labelsQuery, { idField: 'id' });

    const [label, setLabel] = useState('');

    const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLabel(e.target.value);
    }, []);

    const handleLabelKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            await addDoc(labelsCollection, { label });
            setLabel('');
        }
    }, [labelsCollection, label]);

    const handleLabelDelete = (id: string) => deleteDoc(doc(labelsCollection, id));

    if (status === 'loading') {
        return <CircularProgress />;
    }

    return (
        <Stack spacing={1}>
            <TextField
                fullWidth
                placeholder="Label"
                label="Add Label"
                value={label}
                onChange={handleLabelChange}
                onKeyDown={handleLabelKeyDown}
            />
            <Stack direction="row" spacing={1}>
                {labels.map((label) => <Chip
                    key={label.id}
                    label={label.label}
                    onDelete={() => handleLabelDelete(label.id)}
                />)}
            </Stack>
        </Stack>
    );
};

const Snapshots = ({ canEdit }: { canEdit: boolean }) => {
    const firestore = useFirestore();
    const storage = useStorage();
    const [fromDateTime, setFromDateTime] = useState<Date | null>(null);
    const [toDateTime, setToDateTime] = useState<Date | null>(null);

    const snapshotsCollection = useMemo(() => collection(firestore, 'snapshots'), [firestore]);

    const snapshotsQuery = useMemo(
        () => {
            const conditions = [];
            if (fromDateTime) {
                conditions.push(where('id', '>=', fromDateTime.toISOString()));
            }
            if (toDateTime) {
                conditions.push(where('id', '<', toDateTime.toISOString()));
            }
            return query(
                snapshotsCollection,
                ...conditions,
                orderBy('id', 'desc'),
                limit(10));
        },
        [fromDateTime, toDateTime, snapshotsCollection],
    );

    const deleteSnapshot = useCallback(async (snapshot: Snapshot) => {
        await deleteObject(ref(storage, snapshot.imageGcsUri));
        await deleteDoc(doc(snapshotsCollection, snapshot.id))
    }, [snapshotsCollection, storage]);

    const { status, data: snapshots } = useFirestoreCollectionData(snapshotsQuery, { idField: 'id' });

    if (status === 'loading') {
        return <CircularProgress />;
    }

    return (
        <>
            <Container sx={{ display: 'flex', justifyContent: 'center' }}>
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
                            canEdit={canEdit}
                        />
                    </ImageListItem>))}
            </ImageList>
        </>
    );
};

export const Dashboard = () => {
    const { data: signInCheckResult } = useSigninCheck({ requiredClaims: { write: 'true' } });

    return (
        <Stack spacing={3}>
            {signInCheckResult && signInCheckResult.hasRequiredClaims && <Labels />}
            <Snapshots canEdit={signInCheckResult && signInCheckResult.hasRequiredClaims} />
        </Stack>
    );
};
