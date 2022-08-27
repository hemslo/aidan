import { credential } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from './serviceAccountKey.json';

const main = async () => {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.log('Usage: npm run addUser <email> <claims>');
        return;
    }

    const [email, claimsString] = args;

    const claims = JSON.parse(claimsString);

    initializeApp({
        credential: credential.cert(serviceAccount as any)
    });

    const auth = getAuth();

    const user = await auth.getUserByEmail(email);

    console.log(`Current user claims: ${JSON.stringify(user.customClaims)}`);

    await auth.setCustomUserClaims(user.uid, claims);

    const updatedUser = await auth.getUser(user.uid);

    console.log(`Successfully updated user ${email} ${user.uid} claims: ${JSON.stringify(updatedUser.customClaims)}`);
};

main();
