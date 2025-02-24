const express = require("express");
const router = express.Router();
const DangerousTypeController = require("../../controllers/adminController/dangerousTypes");
const controllers = new DangerousTypeController();

router.post("/add", controllers.add);
router.put("/edit/:id", controllers.edit);
router.delete("/delete/:id", controllers.delete);
router.get("/", controllers.getAllType);

module.exports = router;