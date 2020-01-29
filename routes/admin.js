const express = require("express");
const router = express.Router();
const database = require("../services/adminfunction");
const userFunction = require("../services/userfunction");
const Event = require("../models/event");
var stringify = require("csv-stringify");
const User = require("../models/user");
const mailing = require("../services/mail");
const Receipt = require("../models/receipt");
const GCReceipt = require("../models/gcreceipt");
const mail = require("../services/mail");
var fs = require("fs");
const path = require("path");
const eventCsvPath = path.join(__dirname, "event.csv");
// console.log(userCsvPath);
const csv = require("csvtojson");

router.get("/", async (req, res, next) => {
  try {
    let data = await database.searchRender();
    console.log(data);
    // res.json(data);
    res.render("adminindex", { data });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/gc", async (req, res, next) => {
  try {
    let data = await database.searchRender();
    // res.json(data);
    res.render("gc", { data: data, message: "" });
  } catch (error) {
    next(error);
  }
});

// router.post("/gc/search", async (req, res, next) => {
//   try {
//     let data = await Gcreceipt.find({ userId: req.body.data }).populate(
//       "userId"
//     );
//     if (data == null) {
//       return res.json({ message: false });
//     } else {
//       return res.json({ data: data, message: true });
//     }
//   } catch (error) {
//     next(error);
//   }
// });

router.post("/gc/checkout", async (req, res, next) => {
  try {
    let status = await database.GCchekout(req.body.data);
    res.json({ message: status });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/export/id", async (req, res, next) => {
  try {
    let data = await Receipt.find({ "payment.paid": true }).populate(
      "eventIds userId"
    );
    let e = await Event.findById(req.body.id);
    let names = e.name;
    let event = [];
    let combo = [];
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[i].eventIds.length; j++) {
        // console.log(data[i].eventIds[j]);
        if (data[i].eventIds[j].id.toString() == req.body.id) {
          // console.log("YAY");
          event.push(data[i].userId);
        }
        if (data[i].eventIds[j].comboOrNot) {
          combo.push(data[i]);
        }
      }
    }
    // console.log(event);
    // console.log(combo);
    const dbCombos = await Event.find({ comboOrNot: true });
    // const id = req.body.id;
    // console.log(dbCombos);
    for (var i = 0; i < dbCombos.length; i++) {
      for (var j = 0; j < dbCombos[i].comboEventIds.length; j++) {
        if (dbCombos[i].comboEventIds[j].toString() == req.body.id) {
          for (var k = 0; k < combo.length; k++) {
            for (var l = 0; l < combo[k].eventIds.length; l++) {
              if (combo[k].eventIds[l].id == dbCombos[i].id) {
                event.push(combo[k].userId);
              }
            }
          }
        }
      }
    }

    // return res.download(event);
    let columns = {
      gender: "gender",
      university: "university",
      scope: "scope",
      name: "name",
      email: "email",
      contact: "contact",
      tShirtSize: "tShirtSize",
      registration: "registration",
      room: "room",
      event: "event"
    };
    console.log(names);
    let stuff = event.map(hmm => {
      return {
        gender: hmm.gender,
        university: hmm.university,
        scope: hmm.scope,
        name: hmm.name,
        email: hmm.email,
        contact: hmm.contact,
        tShirtSize: hmm.tShirtSize,
        registration: hmm.registration,
        room: hmm.room,
        event: names
      };
    });
    stringify(stuff, { header: true, columns: columns }, (err, output) => {
      if (err) throw err;
      fs.writeFile("event.csv", output, err => {
        if (err) throw err;
        console.log("event.csv saved.");
      });
    });
    return res.download("event.csv");
  } catch (error) {
    next(error);
    next(error);
  }
});

router.get("/gc/receipt/:id", async (req, res, next) => {
  try {
    console.log(req.params.id);
    let gcreceipt = await GCReceipt.find({ userId: req.params.id }).populate(
      "userId"
    );
    // res.json(gcreceipt);
    console.log(gcreceipt);
    if (gcreceipt.length == 0) {
      let data = await database.searchRender();
      return res.render("gc", { data: data, message: "empty" });
    }
    res.render("gc_receipt", { data: gcreceipt });
  } catch (error) {
    next(error);
  }
});

router.get("/allevent", async (req, res, next) => {
  let event = await Event.find({});
  // res.json(event);
  res.render("admin_export", { data: event });
});

router.post("/gc/checkin", async (req, res, next) => {
  try {
    let status = await database.GCcheckin(req.body);
    res.json({ message: status });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/search", async (req, res, next) => {
  try {
    let data = await Receipt.find({
      $and: [{ userId: req.body.data }, { "payment.paid": true }]
    }).populate("eventIds userId");
    let eventnames = [];
    let newdata = data.map(receipt => {
      for (var i = 0; i < receipt.eventIds.length; i++) {
        eventnames.push(receipt.eventIds[i].name);
      }
      return {
        eventname: eventnames,
        user: receipt.userId.name,
        email: receipt.userId.email,
        reg: receipt.userId.registration,
        gender: receipt.userId.gender,
        contact: receipt.userId.contact,
        university: receipt.userId.university
      };
    });
    console.log(newdata[0]);
    res.json(newdata[0]);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/event", async (req, res, next) => {
  try {
    let events = await Event.find({});
    res.json({ events });
  } catch (error) {
    return next(error);
  }
});

router.get("/rDetails", async (req, res, next) => {
  let data = await database.getAllReceipts();
  let content = [];
  data.forEach(hmm => {
    if (hmm.payment.paid) {
      content.push(hmm);
    }
  });
  let output = await database.flatten(content);
  // res.json(output);
  res.render("rDetails", { data: output });
});

router.get("/eDetails", async (req, res, next) => {
  let stuff = await Event.find({}, "name registeredCount");
  res.render("eDetails", { data: stuff });
});

// router.post("/search", async (req, res, next) => {
//   let data = await database.searchUser(req.body);
//   res.json(data);
// });

router.get("/bulk", (req, res, next) => {
  res.render("admin_bulk", {
    user: req.user
  });
});

/**
 * POST /bulk
 *
 * [users]: Array
 * users will have Objects with following keys:
 *  name: String
 *  registration: String
 *  email: String
 *  gender: String
 *  room: String
 *  contact: Number
 *  memberNo: String
 *  section: String
 *  tShirtSize: String
 *  eventIds: Array
 */

router.post("/bulk", async (req, res, next) => {
  try {
    let distinctUsers = {};
    let userPromises = [];
    let eventObject = {};

    // fetch all events and store by ID
    let events = await Event.find({});
    events.forEach(e => {
      eventObject[e._id] = e;
    });

    // combine all users from list
    req.body.users.forEach(user => {
      let email = user.email.toLowerCase().trim();
      let { eventIds, ...others } = user;
      let eventId = eventObject[eventIds[0]]._id;
      if (distinctUsers[email] == undefined) {
        distinctUsers[email] = {
          eventIds: [eventId]
        };
      } else {
        distinctUsers[email].eventIds.push(eventId);
      }
      eventIds = [...new Set(distinctUsers[email].eventIds)];
      distinctUsers[email] = {
        ...others,
        eventIds
      };
    });

    // find and update the users
    Object.keys(distinctUsers).forEach(email => {
      userPromises.push(
        User.findOneAndUpdate({ email }, distinctUsers[email], {
          new: true,
          upsert: true
        })
      );
    });
    const users = await Promise.all(userPromises);

    let receiptPromises = [];

    // generate receipts for the users
    for (let user of users) {
      const email = user.email;
      let { eventIds } = distinctUsers[email];
      let amount = 0;
      eventIds.forEach(
        e => (amount += parseInt(eventObject[e._id].feeDetail.regular))
      );
      receiptPromises.push(
        userFunction.generateReceipt(
          {
            payment: {
              paid: true,
              type: "offline",
              amount
            },
            eventIds
          },
          { id: user._id },
          true
        )
      );
    }
    const receipts = await Promise.all(receiptPromises);

    // sending mail to the recipients
    // @TODO: Limit/batch the number of emails
    let mailPromises = [];
    console.log(receipts);
    for (let generatedReceipt of receipts) {
      const { message, receipt } = generatedReceipt;
      if (message !== "ok") {
        return res.json({ success: false, message });
      }
      mailPromises.push(
        mailing.sendReceiptMail({
          to: receipt.userId.email,
          name: receipt.userId.name,
          events: receipt.eventIds,
          receiptId: receipt.payment.transactionId,
          amount: receipt.payment.amount,
          _id: receipt._id.toString()
        })
      );
    }
    await Promise.all(mailPromises);
    return res.json({ success: true, receipts, users });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.toString() });
  }
});

router.post("/manual", async (req, res, next) => {
  try {
    let receipt = await Receipt.findOne({
      "payment.transactionId": req.body.id
    }).populate("eventIds userId");
    console.log(receipt);
    if (!receipt) {
      return res.json({ message: "receipt doesnt exist" });
    }
    if (receipt.payment.paid) {
      return res.json({ message: "Already paid" });
    }
    eventPromise = [];
    for (var i = 0; i < receipt.eventIds.length; i++) {
      let str = String(receipt.eventIds[i]._id);
      eventPromise.push(Event.findOne({ _id: str }));
    }
    // let event = await Event.findOne({ id: "receipt.eventIds[0].id" });
    let result = await Promise.all(eventPromise);
    result.forEach(event => {
      let count = event.registeredCount;
      count = count + 1;
      event.registeredCount = count;
    });
    result.map(async event => {
      return await event.save();
    });

    // console.log(receipt);
    var emailData = {
      to: receipt.userId.email,
      name: receipt.userId.name,
      events: receipt.eventIds,
      receiptId: receipt.payment.transactionId,
      amount: receipt.payment.amount,
      _id: receipt._id.toString()
    };
    receipt.payment.paid = true;
    await receipt.save();
    await mail.sendReceiptMail(emailData);
    return res.json({ message: "Check Mail" });
  } catch (error) {
    next(error);
  }
});

router.get("/bulkusers", (req, res, next) => {
  res.render("admin_bulk_user", {
    user: req.user
  });
});

router.post("/bulkusers", async (req, res, next) => {
  try {
    let message = "ok";
    let alreadyUser;
    let emailPromise = [];
    const jsonObj = req.body.users;
    let userData = jsonObj.map(data => {
      return {
        name: data.name,
        registration: data.regno,
        email: data.email,
        password: process.env.BULK_PASS,
        gender: data.gender.toLowerCase()
      };
    });
    for (const user in userData) {
      emailPromise.push(User.findOne({ email: userData[user].email }));
    }
    let result = await Promise.all(emailPromise);
    result.forEach(user => {
      if (user) {
        message = "User already Exists please edit in csv";
        alreadyUser = user;
      }
    });
    if (message !== "ok") {
      console.log("User already Exists please edit in csv");
      console.log(alreadyUser);

      return res.json({
        success: false,
        message: "User " + alreadyUser.name + " already exists, check csv"
      });
    }
    for (var i = 0; i < userData.length; i++) {
      userData[i] = new User({
        name: userData[i].name,
        registration: userData[i].registration,
        email: userData[i].email,
        gender: userData[i].gender,
        password: userFunction.generateHash(userData[i].password)
      });
      await userData[i].save(function(err, data) {
        if (err) {
          console.log("error");
        } else {
          console.log("We just saved something");
          console.log(data);
        }
      });
    }
    res.json({ success: true, userData });
  } catch (error) {
    next(error);
  }
});

router.get("/getshirt", async (req, res, next) => {
  try {
    let data = await Receipt.find({ "payment.paid": true }).populate("userId");
    let content = data.map(user => {
      return {
        user: user.toObject().userId
      };
    });
    let newcontent = [];
    for (var i = 0; i < content.length; i++) {
      let userN = content[i].user.name;
      let check = 0;
      for (var j = 0; j < newcontent.length; j++) {
        if (newcontent[j].user.name === userN) {
          check = 1;
        }
      }
      if (check === 0) {
        newcontent.push(content[i]);
      }
    }
    // return res.json(newcontent);
    return res.render("getshirt", { data: newcontent });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
