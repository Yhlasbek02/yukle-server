const express = require("express");
const router = express.Router();
const transportController = require("../../controllers/userController/transportController");
const controllers = new transportController();

router.get("/get-types/:lang", controllers.getTransportTypes);
router.get("/get-trucks/:id/:lang", controllers.getTruckBody);
router.get("/get-transportation-types/:lang", controllers.getTransportationType);
router.post("/add/:lang", controllers.addTransport);
router.get("/:lang", controllers.getTransports);
router.get("/my/:lang", controllers.myTransport);
router.get("/:id/:lang", controllers.specificTransport);
router.delete("/delete/:id/:lang", controllers.deleteTransport);


module.exports = router;