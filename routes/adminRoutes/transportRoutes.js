const express = require("express");
const router = express.Router();
const TransportController = require("../../controllers/adminController/adminTransport");
const controllers = new TransportController();
router.get('/', controllers.getTransports);
router.get('/:id', controllers.getTransport)
router.delete('/delete/:id', controllers.deleteTransport)



module.exports = router;