import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { deleteDoc, doc, addDoc, CollectionReference, DocumentData } from "firebase/firestore";
import { useCallback, useState } from "react";

export const Labels = ({
    canEdit,
    labels,
    labelsCollection,
}: {
    canEdit: boolean,
    labels: DocumentData[],
    labelsCollection: CollectionReference<DocumentData>,
}) => {
    const [label, setLabel] = useState('');

    const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLabel(e.target.value);
    }, []);

    const handleLabelKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            await addDoc(labelsCollection, { name: label });
            setLabel('');
        }
    }, [labelsCollection, label]);

    const handleLabelDelete = (id: string) => deleteDoc(doc(labelsCollection, id));

    return (
        <Stack spacing={1}>
            {canEdit && <TextField
                fullWidth
                placeholder="Label"
                label="Add Label"
                value={label}
                onChange={handleLabelChange}
                onKeyDown={handleLabelKeyDown}
            />}
            <Stack direction="row" spacing={1}>
                {labels.map((label) => <Chip
                    key={label.id}
                    label={label.name}
                    onDelete={canEdit ? () => handleLabelDelete(label.id) : undefined}
                />)}
            </Stack>
        </Stack>
    );
};
