const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin/firebaseServiceAccountKey.json');

// Initialize Firebase Admin SDK only if not initialized already
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Optional: Uncomment the following line if you are using Firestore or Realtime Database
    // Replace the URL with your Firebase project's database URL
    // databaseURL: "https://your-firebase-project.firebaseio.com"
  });
}

const db = admin.firestore(); // Get Firestore instance
const projectId = admin.app().options.credential.projectId; // This retrieves your Firebase project ID

// Log a message when successfully connected to Firestore
db.listCollections()
  .then(() => {
    console.log(`Connected to Firebase Firestore successfully! Project: ${projectId}`);
  })
  .catch(error => {
    console.error("Error connecting to Firebase Firestore:", error);
  });

module.exports = { admin, db };
