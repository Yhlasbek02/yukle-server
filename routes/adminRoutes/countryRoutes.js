const express = require("express");
const router = express.Router();
const CountryController = require("../../controllers/adminController/adminCountryController");
const controllers = new CountryController();

router.get('/', controllers.getCountry);
router.post('/add', controllers.addCountry);
router.delete('/delete/:id', controllers.deleteCountry);
router.put('/edit/:id', controllers.editCountry);
router.get('/cities', controllers.getCities);
router.post('/add-city', controllers.addCity);
router.put('/edit-city/:id', controllers.editCity);
router.delete('/delete-city/:id', controllers.deleteCity);


module.exports =router;