const express = require("express");
const router = express.Router();
const controllers = require("../../controllers/userController//messageController");

router.post("/create-chat/:lang", controllers.createChat);
router.post("/add-message/:chatId/:lang", controllers.addMessage);
router.get("/chats/:lang", controllers.getChats);
router.get("/messages/:chatId/:lang", controllers.getMessages);
router.delete("/delete-message/:id/:lang", controllers.deleteMessage);
router.delete("/delete-chat/:id/:lang", controllers.deleteChat);

module.exports = router;