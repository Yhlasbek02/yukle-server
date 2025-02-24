const express = require("express");
const router = express.Router();
const UserController = require("../../controllers/adminController/adminUserController");
const controllers = new UserController();

router.get("/", controllers.getAllUsers);
router.get("/:id", controllers.getUser);
router.delete("/delete/:id", controllers.deleteUser);
router.put("/change-paid/:id", controllers.changePaid);



module.exports = router;