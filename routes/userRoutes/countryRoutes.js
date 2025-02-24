const express = require("express");
const router = express.Router();
const countryController = require("../../controllers/userController/countryController");
const controllers = new countryController();

router.get("/countries/:lang", controllers.getCountries);
router.get("/cities/:countryId/:lang", controllers.getCities);

module.exports = router;