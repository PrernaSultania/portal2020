var express = require("express");
var router = express.Router();
const database = require("../services/adminfunction");
const auth = require("../middleware/authentication");
const adminRouter = require("./admin");
const userRouter = require("./users");
const request = require("request-promise");
const User = require("../models/user");
const jwt = require("../utils/jwt");
const bcrypt = require("bcrypt-nodejs");
const userFunction = require("../services/userfunction");
const passport = require("passport");
const Event = require("../models/event");

router.get("/", (req, res, next) => {
  res.json({ message: "ARCS portal API" });
});

router.get("/route", (req, res, next) => {
  try {
    console.log("entered route");
    console.log(req.user.role);
    if (req.user.role === "admin") {
      return res.redirect("/admin");
    }
    return res.redirect("/user");
  } catch (error) {
    // return json(error);
    return res.json({ error: error.message });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ success: false, message: "User not found!" });
    }
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.json({ success: false, message: "Incorrect Password" });
    }
    const token = jwt.generate(user._id);
    res.setHeader("token", token);
    console.log(token);
    res.json({ success: true });
  } catch (error) {
    return res.json({ error: error.message, success: false });
  }
});

router.get("/login-webview", auth.isApiUser, (req, res, next) => {
  // hax
  req.body.email = "nil";
  req.body.password = "nil";
  passport.authenticate("loginwebview", (err, user) => {
    if (err) return next(err);
    if (!user)
      return res.json({ success: false, message: "User doesn't exist" });
    req.logIn(user, async error => {
      if (error) return next(error);
      let event = await Event.findOne({ name: req.query.ename.trim() });
      if (!event) {
        return res.json({ success: false, message: "Event doesn't exist" });
      }
      return res.render("eventswebview", { eventId: event._id });
    });
  })(req, res, next);
});

router.post("/register-ios", async (req, res, next) => {
  try {
    console.log(req.body);
    let message = await userFunction.validate(req.body);
    if (message != "ok") {
      return res.json({ success: false, error: message });
    }
    message = await database.addUser(req.body);
    if (message === "ok") {
      return res.json({ success: true, message: message });
    }
    res.json({ message: message });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const options = {
      method: "POST",
      formData: {
        secret: process.env.ANDROID_RECAPTCHA_SECRET,
        response: req.body["g-recaptcha-response"]
      }
    };
    let response = await request(
      "https://www.google.com/recaptcha/api/siteverify",
      options
    );
    let cResponse = JSON.parse(response);
    console.log(cResponse);
    if (!cResponse.success) {
      return res.json({ success: false, message: "Invalid Captcha" });
    }
    let vResponse = userFunction.validate(req.body);
    if (vResponse !== "ok") {
      return res.json({ success: false, message: vResponse });
    }
    let status = await database.addUser(req.body);
    if (status === "ok") {
      return res.json({ success: true, message: "ok" });
    }
    res.json({ message: status });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

router.get("/logout", auth.isLoggedIn, (req, res) => {
  req.logout();
  res.json("Logged Out");
});

router.all("/admin*", auth.isApiAdmin);
router.all("/user*", auth.isApiUser);

router.use("/admin", adminRouter);
router.use("/user", userRouter);

module.exports = router;
