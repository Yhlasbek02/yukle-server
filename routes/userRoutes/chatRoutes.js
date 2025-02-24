const express = require("express");
const router = express.Router();
const ChatController = require("../../controllers/userController/chatController");
const controllers = new ChatController();

router.post("/message/add/:lang", controllers.addMessage);
router.get("/messages/:lang", controllers.getMessages);




module.exports = router;