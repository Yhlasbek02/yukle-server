const express = require("express");
const router = express.Router();
const chatController = require("../../controllers/adminController/chatController");
const controllers = new chatController();



router.post("/add/:id", controllers.addMessage);
router.get("/all", controllers.getAllMessages);
router.get("/:id", controllers.getSpecificMessage);
router.delete("/delete/:id", controllers.deleteMessage);

module.exports = router;