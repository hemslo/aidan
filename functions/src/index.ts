import { onRequest } from "firebase-functions/v2/https";

export const helloworld = onRequest({
    region: 'us-west1'
}, (req, res) => {
    res.send("Hello");
});
