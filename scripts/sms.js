require("dotenv").config();
const mongoose = require("mongoose");
const request = require("request-promise");
const User = require("../models/user");
const API_URL = "https://api.textlocal.in/send/";

mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false },
  async err => {
    if (err) console.log(err);

    // if (!err) console.log("Connection successful");
    // let receipts = await Receipt.find({ "payment.paid": true })
    //   .populate("userId eventIds")
    //   .exec();
    // let data = receipts.map(r => {
    //   return { name: r.userId.name, events: r.eventIds };
    // });
  }
);
