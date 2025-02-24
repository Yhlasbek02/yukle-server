const {User} = require("../../models/models");
const admin = require("firebase-admin");
const serviceAccount = require("./service_account.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging
  
class notificationController {
    async addCargoNotification (req, res) {
        try {
            const users = await User.findAll({where: {cargoNotification: true}, attributes: ['id', 'fcm_token']});
            const notificationMessages = [];
            for (const user of users) {
                const message = {
                    notification: {
                        title: req.body.title,
                        body: req.body.body,
                        image: req.body.imageUrl,
                    },
                    token: user.fcm_token
                }
                notificationMessages.push(message);     
            }
            const response = await messaging.sendAll(notificationMessages);
            res.status(200).json({
                message: 'Notification sent successfully'
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in getting cargo notification"});
        }
    }
}

