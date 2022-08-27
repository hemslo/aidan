import { credential } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from './serviceAccountKey.json';

const main = async () => {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.log('Usage: npm run addUser <email> <password>');
        return;
    }

    initializeApp({
        credential: credential.cert(serviceAccount as any)
    });

    const [email, password] = args;

    const userRecord = await getAuth().createUser({
        email,
        password,
    });

    console.log(`Successfully created new user: ${userRecord.uid}`);
};

main();
