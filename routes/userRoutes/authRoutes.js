const express = require("express");
const router = express.Router();
const UserAuthentification = require("../../controllers/userController/authController");
const checkUserAuth = require("../../middlewares/auth");
const expressWs = require("express-ws");
const UserAuth = new UserAuthentification()

expressWs(router); 

router.ws("/ws", (ws, req) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log("received:", message);
    ws.send("Echo: " + message);
  });

  ws.on("close", (code, reason) => {
    console.log("Client disconnected with code:", code, "reason:", reason);
  });

});




router.get("/", async (req, res) => {
    res.send({message: "test"})
})
router.post("/sign-up/email/:lang", UserAuth.registerUserByEmail);
router.post("/sign-up/mobile/:lang", UserAuth.registerUserByPhone);
router.post("/verify/:lang", UserAuth.verifyCode);
router.post("/login/email/:lang", UserAuth.loginByEmail);
router.post("/login/mobile/:lang", UserAuth.loginByMobile);
router.post("/resend-code/email/:lang", UserAuth.resendVerificationCodeByEmail);
router.post("/resend-code/mobile/:lang", UserAuth.resendVerificationCodeByMobile);
router.post("/verify-otp/:lang", UserAuth.verifyOtp);
router.post("/verify-mobile-otp/:lang", UserAuth.verifyMobileOtp);
router.post("/change-pass/:lang", checkUserAuth, UserAuth.createNewPassword);
router.get("/profile/:lang", checkUserAuth, UserAuth.getMyProfile);
router.post("/change-account/:lang", checkUserAuth, UserAuth.editAccount);
router.delete("/delete-account/:lang", checkUserAuth, UserAuth.deleteAccount);
router.post("/logout/:lang", checkUserAuth, UserAuth.logout);
router.post("/change-notification/:type/:lang", checkUserAuth, UserAuth.changeNotification);
module.exports = router;