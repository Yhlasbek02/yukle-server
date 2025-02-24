const express = require("express");
const router = express.Router();
const notificationController = require("../../controllers/userController/lastNotifications");
const controllers = new notificationController();
router.get("/:lang", controllers.getNotifications);
router.get("/web/:lang", controllers.getWebNotifications);
module.exports= router;