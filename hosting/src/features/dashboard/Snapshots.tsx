import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from "@mui/material/Divider";
import FormControl from '@mui/material/FormControl';
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Snapshot } from "../camera/Camera";
import { query, orderBy, limit, deleteDoc, doc, where, CollectionReference, DocumentData, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useCallback, useMemo, useState } from "react";
import { useFirestoreCollectionData,  useStorage, useStorageDownloadURL } from "reactfire";

const DownloadImage = ({ snapshot }: { snapshot: Snapshot }) => {
    const storage = useStorage();
    const snapshotRef = ref(storage, snapshot.imageGcsUri);
    const { status, data: imageURL } = useStorageDownloadURL(snapshotRef);
    if (status === 'loading') {
        return <CircularProgress />;
    }
    return <img src={imageURL} alt={snapshot.id} width="100%" loading="lazy" />;
};

const SnapshotImageActions = ({
    handleDeleteSnapshot,
    disableDelete,
    handleLabelChange,
    label,
    labels,
}: {
    handleDeleteSnapshot: () => Promise<void>,
    disableDelete: boolean,
    handleLabelChange: (event: SelectChangeEvent) => Promise<void>,
    label?: string,
    labels: DocumentData[],
}) => {
    return (<Stack direction="row" spacing={2} sx={{m: 1}}>
        <FormControl fullWidth>
            <InputLabel>Label</InputLabel>
            <Select
                value={label || ""}
                label="Label"
                onChange={handleLabelChange}
                defaultValue=""
            >
                <MenuItem key="empty" value=""><em>None</em></MenuItem>
                {labels.map((label) => <MenuItem key={label.id} value={label.name}>{label.name}</MenuItem>)}
            </Select>
        </FormControl>
        <Button
            startIcon={<DeleteIcon />}
            onClick={handleDeleteSnapshot}
            disabled={disableDelete}
        >
            Delete
        </Button>
    </Stack>);
};

const SnapshotImage = ({
    snapshot,
    deleteSnapshot,
    updateSnapshotLabel,
    canEdit,
    labels,
}: {
    snapshot: Snapshot,
    deleteSnapshot: (snapshot: Snapshot) => Promise<void>,
    updateSnapshotLabel: (snapshot: Snapshot, label?: string) => Promise<void>,
    canEdit: boolean,
    labels: DocumentData[],
}) => {
    const [disableDelete, setDisableDelete] = useState(false);

    const handleDeleteSnapshot = useCallback(async () => {
        setDisableDelete(true);
        await deleteSnapshot(snapshot)
    }, [deleteSnapshot, snapshot]);

    const handleLabelChange = useCallback(
        (event: SelectChangeEvent) => updateSnapshotLabel(snapshot, event.target.value),
        [updateSnapshotLabel, snapshot],
    );

    return (
        <>
            {disableDelete ? <CircularProgress /> : <DownloadImage snapshot={snapshot} />}
            <ImageListItemBar
                title={snapshot.id}
                position="below"
                actionIcon={canEdit && <SnapshotImageActions
                    handleDeleteSnapshot={handleDeleteSnapshot}
                    disableDelete={disableDelete}
                    handleLabelChange={handleLabelChange}
                    label={snapshot.label}
                    labels={labels}
                />}
                actionPosition="right"
            />
        </>);
};

export const Snapshots = ({
    canEdit,
    snapshotsCollection,
    labels,
}: {
    canEdit: boolean,
    snapshotsCollection: CollectionReference<DocumentData>,
    labels: DocumentData[],
}) => {
    const storage = useStorage();
    const [fromDateTime, setFromDateTime] = useState<Date | null>(null);
    const [toDateTime, setToDateTime] = useState<Date | null>(null);

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

    const updateSnapshotLabel = useCallback(async (snapshot: Snapshot, label?: string) => {
        await updateDoc(doc(snapshotsCollection, snapshot.id), { label });
    }, [snapshotsCollection]);

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
                            deleteSnapshot={deleteSnapshot}
                            updateSnapshotLabel={updateSnapshotLabel}
                            canEdit={canEdit}
                            labels={labels}
                        />
                    </ImageListItem>))}
            </ImageList>
        </>
    );
};
