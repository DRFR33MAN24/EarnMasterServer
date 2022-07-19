const admin = require("firebase-admin");

const serviceAccount = require("./firebase.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const notify = async (options, message) => {
  try {
    const { title, body, imageUrl } = message;
    const token = options;
    await admin.messaging().sendMulticast({
      token,
      notification: {
        title,
        body,
        imageUrl,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { notify };
