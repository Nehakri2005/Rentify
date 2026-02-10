const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveredirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

router.get("/signup", userController.renderSignUpForm);

router.post("/signup", wrapAsync(userController.SignUp));

//for login
router.get("/login", userController.renderLoginForm);

router.post(
  "/login",
  saveredirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.Login
);

router.get("/logout", userController.LogOut);

module.exports = router;
