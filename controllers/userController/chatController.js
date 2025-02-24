const { Message, adminMessage } = require("../../models/models");

class ChatController {
    async addMessage(req, res) {
        try {
            const { text } = req.body;
            const { lang } = req.query;
            if (!text) {
                if (lang === "en") {
                    return res.status(404).json({ message: "Field is required" });
                } else if (lang === "ru") {
                    return res.status(404).json({ message: "Field is required russian" });
                } else {
                    return res.status(404).json({ message: "Field is required" });
                }
            }
            const newMessage = await Message.create({
                text: text,
                senderId: req.user.id
            });
            if (lang === "en") {
                return res.status(200).json({ message: "Message sent successfully", newMessage });
            } else if (lang === "ru") {
                return res.status(200).json({ message: "Message sent successfully", newMessage });
            } else {
                return res.status(200).json({ message: "Message sent successfully", newMessage });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in add message" });
        }
    }

    async getMessages(req, res) {
        try {
            const id = req.user.id;
            let messages = await Message.findAll({
                where: { senderId: id },
                order: [
                    ['id', 'ASC']
                ],
                include: [
                    {
                        model: adminMessage,
                        as: "user_message"
                    }
                ]
            }) || [];
            res.status(200).json({ messages });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting messages" });
        }
    }
}

module.exports = ChatController;
