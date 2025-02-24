const express = require("express");
const router = express.Router();

const notificationController = require("../../controllers/adminController/notificationController");
const controllers = new notificationController();

router.post("/cargo", controllers.addCargoNotification);


module.exports = router;