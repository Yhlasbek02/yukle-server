const express = require("express");
const router = express.Router();
const AdminAuthentification = require("../../controllers/adminController/adminAuthentification");
const checkAdminAuth = require("../../middlewares/adminAuth");
const AdminAuth = new AdminAuthentification();

router.post('/register', AdminAuth.registerAdmin);
router.post('/login', AdminAuth.login);
router.post('/forgot-password', AdminAuth.forgotPassword);
router.post("/verify", AdminAuth.verifyCode);
router.get('/profile', checkAdminAuth, AdminAuth.getAdmin);
router.post('/change-password', checkAdminAuth, AdminAuth.changePassword);
router.delete('/delete-account', checkAdminAuth, AdminAuth.deleteAccount);


module.exports = router;

