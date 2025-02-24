const express = require("express");
const router = express.Router();
const TransportationTypeController = require("../../controllers/adminController/transportationType");
const controllers = new TransportationTypeController();

router.post("/add", controllers.add);
router.put("/edit/:id", controllers.edit);
router.delete("/delete/:id", controllers.delete);
router.get("/", controllers.getAllType);



module.exports = router;