const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");

const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api-index");
const paymentRouter = require("./routes/payments");
const mongoose = require("mongoose");
const session = require("cookie-session");
const flash = require("connect-flash");
require("dotenv").config();

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Data base setup

mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false },
  err => {
    if (!err) console.log("Connection successful");
  }
);

const keys = ["Ron", "Swanson"];
const expiryDate = new Date(5 * Date.now() + 60 * 60 * 1000); // 5 hours
// console.log(expiryDate);
app.use(
  session({
    secret: "mustache",
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: true,
      expires: expiryDate
    },
    keys: keys
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use("/", indexRouter);
app.use("/api", apiRouter);
app.use("/payment", paymentRouter);

require("./config/passport")(passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
