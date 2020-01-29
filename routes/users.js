var express = require("express");
var router = express.Router();
var userFunction = require("../services/userfunction");

/* GET users listing. */
router.get("/", (req, res, next) => {
  res.redirect("/event");
});

router.get("/profile", async (req, res, next) => {
  try {
    let data = await userFunction.getProfile(req.user.id);
    // Changes
    res.render("profile", { data: data, message: "" });
  } catch (error) {
    return next(error);
  }
});

router.get("/resetpass", (req, res, next) => {
  try {
    // Enter the file to be rendered here
    res.render("resetpass", { message: "" });
    // remove res.json()
    // res.json({ message: "This is the resetpass route" });
  } catch (error) {
    next(error);
  }
});

router.post("/resetpass", async (req, res, next) => {
  try {
    let status = await userFunction.checkPass(
      req.user.id,
      req.body.oldpassword
    );
    if (status !== "ok") {
      //change to
      res.render("resetpass", { message: status });
      // return res.json(status);
    }
    await userFunction.updatePass(req.user.id, req.body.password);
    //we need to redirect from here after success, i will do it
    // return res.json({ message: "Password Updated" });

    // changes from here
    let data = await userFunction.getProfile(req.user.id);
    return res.render("profile", { data: data, message: "Password Updated" });
    // till here
  } catch (error) {
    next(error);
  }
});

router.get("/event", async (req, res, next) => {
  try {
    let events = await userFunction.getEvent(req.user);
    res.render("events", { data: events, user: req.user });
  } catch (error) {
    return next(error);
  }
});

router.get("/receipt", async (req, res, next) => {
  try {
    let data = await userFunction.getReceipt(req.user.id);
    // res.json(data);
    res.render("receipt", { data: data });
  } catch (error) {
    return next(error);
  }
});

router.post("/register-event", async (req, res, next) => {
  try {
    let receiptDetails = await userFunction.generateReceipt(
      { eventIds: req.body.eventIds },
      req.user
    );

    if (receiptDetails.message !== "ok") {
      return res.json({ message: receiptDetails.message });
    }
    return res.json({
      message: receiptDetails.message,
      receiptID: receiptDetails.receipt._id
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
});

router.get("/app-profile", async (req, res, next) => {
  try {
    let data = await userFunction.getProfile(req.user.id);
    res.json(data);
  } catch (error) {
    return res.json({ error: error.message });
  }
});

router.get("/app-receipt", async (req, res, next) => {
  try {
    let data = await userFunction.getApiReceipt(req.user.id);
    res.json(data);
  } catch (error) {
    return res.json({ error: error.message });
  }
});

module.exports = router;
