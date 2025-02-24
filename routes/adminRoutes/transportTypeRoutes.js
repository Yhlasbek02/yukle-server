const express = require("express");
const router = express.Router();
const TransportTypeController = require("../../controllers/adminController/adminTransportTypeController");
const controllers = new TransportTypeController();

router.post("/add", controllers.addTransportType);
router.put("/edit/:id", controllers.editTransportType);
router.delete("/delete/:id", controllers.deleteTransportType);
router.get("/", controllers.getAllTransportType);


module.exports = router;