const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const transportRoutes = require("./transportRoutes");
const countryRoutes = require("./countryRoutes");
const cargoRoutes = require("./cargoRoutes");
const chatRoutes = require("./chatRoutes");
const notificationRoutes = require("./notification");
const messageRoutes = require("./messageRoutes")
const checkUserAuth = require("../../middlewares/auth");
router.use("/auth", authRoutes);
router.use("/", checkUserAuth, countryRoutes);
router.use("/transport", checkUserAuth, transportRoutes);
router.use("/cargo", checkUserAuth, cargoRoutes);
router.use("/chat", checkUserAuth, chatRoutes);
router.use("/notification", checkUserAuth, notificationRoutes);
router.use("/message", checkUserAuth, messageRoutes);
module.exports = router;