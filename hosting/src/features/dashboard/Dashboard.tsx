import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { collection, query } from "firebase/firestore";
import { useFirestore, useFirestoreCollectionData, useSigninCheck } from "reactfire";
import { useMemo } from "react";
import { Labels } from "./Labels";
import { Snapshots } from "./Snapshots";

export const Dashboard = () => {
    const firestore = useFirestore();

    const labelsCollection = useMemo(() => collection(firestore, 'labels'), [firestore]);
    const labelsQuery = useMemo(() => query(labelsCollection), [labelsCollection]);
    const { status: labelsStatus, data: labels } = useFirestoreCollectionData(labelsQuery, { idField: 'id' });

    const snapshotsCollection = useMemo(() => collection(firestore, 'snapshots'), [firestore]);

    const { data: signInCheckResult } = useSigninCheck({ requiredClaims: { write: 'true' } });

    return (
        <Stack spacing={3}>
            {labelsStatus === 'loading'
                ? <CircularProgress />
                : <Labels canEdit={signInCheckResult?.hasRequiredClaims} labels={labels} labelsCollection={labelsCollection} />}
            <Snapshots canEdit={signInCheckResult?.hasRequiredClaims} snapshotsCollection={snapshotsCollection} labels={labels} />
        </Stack>
    );
};
