const admin = require("firebase-admin");
const serviceAccount = require("./accountKey.json");
const smsSenderAccount = require("./yuklesmssender.json");

let firebaseAdmin;
let smsSenderApp;

try {
    // Initialize the first Firebase project with a unique name
    firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    }, 'firebaseAdmin'); // Name the first app 'firebaseAdmin'

    console.log("Firebase Admin initialized successfully:", firebaseAdmin);

    // Initialize the second Firebase project with a unique name
    smsSenderApp = admin.initializeApp({
        credential: admin.credential.cert(smsSenderAccount)
    }, 'smsSenderApp'); // Name the second app 'smsSenderApp'

    console.log("Firebase SMS initialized: ", smsSenderApp);
} catch (error) {
    console.error("Error initializing Firebase Admin:", error);
}

const options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24
};

const sendNotification = async (deviceToken, title, body, uuid, type, locationCountry) => {
    try {
        await admin.messaging(firebaseAdmin).send({
            token: deviceToken,
            apns: {
                payload: {
                    aps: {
                        alert: {
                            title: title,
                            body: body,
                        },
                    },
                },
            },
            notification: {
                title: title,
                body: body
            },
            data: {
                uuid: uuid,
                type: type,
                title: title,
                body: locationCountry
            }

        });
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}

const sendMessage = async (deviceToken, chatId, message, user, time) => {
    try {
        await admin.messaging(firebaseAdmin).send({
            token: deviceToken,
            apns: {
                payload: {
                    aps: {
                        alert: {
                            title: user,
                            body: message,
                        },
                    },
                },
            },
            notification: {
                title: user,
                body: message
            },
            data: {
                chatId: String(chatId),  // Ensure it's a string
                time: String(time),      // Ensure it's a string
                title: String(user),     // Ensure it's a string
                body: String(message)    // Ensure it's a string
            }
        });
    } catch (error) {
        console.error("server error", error);
    }
};



const sendSmsCode = async (title, body) => {
    try {
        await admin.messaging(smsSenderApp).send({
            topic: 'general',
            apns: {
                payload: {
                    aps: {
                        alert: {
                            title: title,
                            body: body,
                        },
                    },
                },
            },
            notification: {
                title: title,
                body: body
            }
        });
        console.log({
            title: title,
            body: body
        })
        console.log("Notification sent successfully");
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}

module.exports = { sendNotification, sendMessage, sendSmsCode };
