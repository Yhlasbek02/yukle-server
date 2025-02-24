const express = require("express");
const router = express.Router();
const CargoTypeController = require("../../controllers/adminController/adminCargoTypeController");
const Controller = new CargoTypeController();


router.post('/add', Controller.addCargoType);
router.put("/edit/:id", Controller.editCargoType);
router.delete("/delete/:id", Controller.deleteCargoType);
router.get("/", Controller.getAllCargoType);



module.exports = router;