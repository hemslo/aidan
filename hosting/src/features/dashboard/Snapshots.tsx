import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from "@mui/material/Divider";
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Snapshot } from "../camera/Camera";
import { query, orderBy, limit, deleteDoc, doc, where, CollectionReference, DocumentData, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useFirestoreCollectionData, useStorage, useStorageDownloadURL } from "reactfire";

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
    handleLabelChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>,
    label?: string,
    labels: DocumentData[],
}) => {
    return (<Stack direction="row" spacing={2} sx={{ m: 1 }}>
        <FormControl fullWidth>
            <RadioGroup
                row
                aria-labelledby="demo-form-control-label-placement"
                name="position"
                defaultValue="bottom"
                value={label || ""}
                onChange={handleLabelChange}
            >
                <FormControlLabel
                    value=""
                    control={<Radio />}
                    label="None"
                    key="none"
                    labelPlacement="top"
                />
                {labels.map((label) => <FormControlLabel
                    key={label.id}
                    control={<Radio />}
                    value={label.name}
                    label={label.name}
                    labelPlacement="top"
                />)}
            </RadioGroup>
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
        (event: ChangeEvent<HTMLInputElement>) => updateSnapshotLabel(snapshot, event.target.value),
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

    const handleNextPage = useCallback(() => {
        if (snapshots.length > 0) {
            setToDateTime(new Date(snapshots[snapshots.length - 1].id.slice(0, -5)));
        }
    }, [snapshots]);

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
                <Divider orientation="vertical" flexItem>-</Divider>
                <Button
                    startIcon={<NavigateNextIcon />}
                    onClick={handleNextPage}
                    disabled={snapshots.length === 0}
                >Next Page</Button>
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
