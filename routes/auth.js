const router = require("express").Router();
const controller = require("../controllers");
const { Auth } = require('../middlewares/auth')

router.post("/", controller.auth.login)

router.patch("/verify", controller.auth.verify)

router.patch("/resendOtp", controller.auth.resendOtp)

router.patch("/change-password", Auth, controller.auth.passwordChange)

router.post('/recover', controller.auth.recover);

router.post('/reset', controller.auth.resetPassword);

module.exports = router