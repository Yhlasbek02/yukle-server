const express = require("express");
const router = express.Router();
const TruckBodyController = require("../../controllers/adminController/truckBodyController");
const controllers = new TruckBodyController();

router.post("/add", controllers.add);
router.put("/edit/:id", controllers.edit);
router.delete("/delete/:id", controllers.delete);
router.get("/", controllers.getAllType);

module.exports = router;