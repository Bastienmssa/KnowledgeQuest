// firebaseAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("./config/serviceAccountKey.json"); // <-- à adapter

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
