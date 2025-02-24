const express = require("express");
const router = express.Router();
const CargoController = require("../../controllers/userController/cargoController");
const controllers = new CargoController();

router.get("/get-types/:lang", controllers.getCargoTypes);
router.get("/get-dangerous-types/:lang", controllers.getDangerousTypes);
router.post("/add/:lang", controllers.addCargo);
router.get("/:lang", controllers.getCargos);
router.get("/my/:lang", controllers.getMyCargos);
router.get("/:id/:lang",controllers.specificCargo);
router.delete("/delete/:id/:lang", controllers.deleteCargo);

module.exports = router;