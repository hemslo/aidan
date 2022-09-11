import {credential} from 'firebase-admin';
import {initializeApp} from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import serviceAccount from './serviceAccountKey.json';

const main = async () => {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.log('Usage: npm run setObjectLifecycleRule BUCKET DAYS');
        return;
    }

    initializeApp({
        credential: credential.cert(serviceAccount as any)
    });

    const bucket = args[0];
    const age = parseInt(args[1], 10);

    const bucketRef= getStorage().bucket(bucket);

    await bucketRef.setMetadata({lifecycle: null});

    const [metadata] = await bucketRef.addLifecycleRule({
        action: 'delete',
        condition: {
            age,
            matchesPrefix: ['snapshots/'],
        },
    });

    console.log(`Lifecycle management rules are: ${JSON.stringify(metadata.lifecycle.rule)}`);
};

main();
