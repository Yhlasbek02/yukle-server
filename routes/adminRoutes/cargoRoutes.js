const express = require("express");
const CargoController = require("../../controllers/adminController/adminCargoController");
const router = express.Router();
const controllers = new CargoController;

router.get('/', controllers.getCargos);
router.get("/:id", controllers.getCargo);
router.delete("/delete/:id", controllers.deleteCargo);




module.exports = router;