const express = require("express");
const router = express.Router();
const passport = require("passport");
const adminRouter = require("./admin");
const userRouter = require("./users");
const database = require("../services/adminfunction");
const userFunction = require("../services/userfunction");
const auth = require("../middleware/authentication");
const Event = require("../models/event");
const request = require("request-promise");

router.get("/", (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role == "admin") {
      // console.log(req.user.role);
      return res.redirect("/admin");
    }
    return res.redirect("/user/event");
  }
  res.render("index", { title: "ARCS19" });
});

router.get("/register", (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role == "admin") {
      // console.log(req.user.role);
      return res.redirect("/admin");
    }
    return res.redirect("/user/event");
  }
  res.render("register", { message: " " });
});

router.get("/route", (req, res, next) => {
  try {
    console.log("entered route");
    console.log(req.user.role);
    if (req.user.role === "admin") {
      return res.redirect("/admin");
    }
    return res.redirect("/user/event");
  } catch (error) {
    return next(error);
  }
});

router.get("/login", (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role == "admin") {
      // console.log(req.user.role);
      return res.redirect("/admin");
    }
    return res.redirect("/user/event");
  }
  res.render("login", { message: req.flash("message") || "" });
});

router.post(
  "/login",
  passport.authenticate("login", {
    successRedirect: "/route",
    failureRedirect: "/login",
    failureFlash: true
  })
);

router.post("/register", async (req, res, next) => {
  try {
    // console.log(req.body["g-recaptcha-response"]);
    // const options = {
    //   method: "POST",
    //   formData: {
    //     secret: process.env.RECAPTCHA_SECRET,
    //     response: req.body["g-recaptcha-response"]
    //   }
    // };
    // let response = await request(
    //   "https://www.google.com/recaptcha/api/siteverify",
    //   options
    // );
    // let cResponse = JSON.parse(response);
    // if (!cResponse.success) {
    //   return res.render("register", { message: "Invalid Captcha" });
    // }
    let vResponse = userFunction.validate(req.body);
    if (vResponse !== "ok") {
      return res.render("register", { message: vResponse });
    }
    let status = await database.addUser(req.body);
    if (status === "ok") {
      return passport.authenticate("login", {
        successRedirect: "/user/event",
        failureRedirect: "/login",
        failureFlash: true
      })(req, res, function() {
        res.redirect("/user/event");
      });
      // return res.render("register", { message: "ok" });
    }
    return res.render("register", { message: status });
  } catch (error) {
    return next(error);
  }
});

// router.post("/addevent", async (req, res, next) => {
//   try {
//     // let data = JSON.parse(req.body);
//     let newEvent = new Event(req.body);
//     await newEvent.save();
//     console.log(req.body);
//     // console.log(newEvent);
//     res.json(newEvent);
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// });

router.get("/logout", auth.isLoggedIn, (req, res) => {
  req.logout();
  res.render("index");
});

router.all("/admin*", auth.isAdmin);
router.all("/user*", auth.isUser);

router.use("/admin", adminRouter);
router.use("/user", userRouter);

module.exports = router;
