const Promise = require("bluebird");
const crypto = Promise.promisifyAll(require("crypto"));
const salt_factor = 8;
const User = require("../models/user");
const Event = require("../models/event");
const Receipt = require("../models/receipt");
const bcrypt = require("bcrypt-nodejs");
const Mail = require("../services/mail");
require("dotenv").config();

// Changes have to be made to the content to be displayed in the profile setting

module.exports.getProfile = async id => {
  let data = await User.findById(
    id,
    "name registration email gender room contact university"
  );
  return data;
};

module.exports.getEvent = async userDetails => {
  if (userDetails.scope === "internal") {
    return await Event.find({ eventScope: "internal" }).exec();
  }
  return await Event.find({}).exec();
};

module.exports.getReceipt = async userId => {
  let data = await Receipt.find({ userId: userId }).populate("eventIds");
  return data;
};

module.exports.getApiReceipt = async userId => {
  let data = await Receipt.find({
    $and: [{ userId: userId }, { "payment.paid": true }]
  }).populate("eventIds");
  let content = data.map(stuff => {
    let name = "";
    for (let i = 0; i < stuff.eventIds.length; i++) {
      name = stuff.eventIds[i].name + "+" + name;
    }
    return {
      eventName: name
    };
  });
  return content;
};

module.exports.generateReceipt = async (
  receiptDetails,
  userDetails,
  bulk = false
) => {
  const userReceipts = await Receipt.find({ userId: userDetails.id }).populate(
    "eventIds"
  );
  let checkEvent = [];
  checkEvent.push(receiptDetails.eventIds);
  const combos = await Event.find({ comboOrNot: true });
  for (const combo of combos) {
    for (const id of receiptDetails.eventIds) {
      if (combo.id == id) {
        for (let i = 0; i < combo.comboEventIds.length; i++) {
          checkEvent.push(combo.comboEventIds[i]);
        }
      }
    }
  }

  for (const receipt of userReceipts) {
    for (const event of receipt.eventIds) {
      for (const id of checkEvent) {
        if (event.id.toString() == id && receipt.payment.paid) {
          return { message: "Already registered and paid for event" };
        }
      }
    }
  }

  for (const combo of combos) {
    for (const id of receiptDetails.eventIds) {
      if (id == combo.id) {
        if (combo.name === "IEEE-Member Combo") {
          if (!userDetails.ieeemember) {
            return { message: "You are not an IEEE-Member" };
          }
        }
      }
    }
  }

  let total = 0;
  let newReceipt = new Receipt();
  let promises = [];
  let eventIds;
  if (!Array.isArray(receiptDetails.eventIds)) {
    eventIds = [];
    eventIds.push(receiptDetails.eventIds);
  } else {
    eventIds = receiptDetails.eventIds;
  }

  for (const eventId of eventIds) {
    promises.push(
      Event.findById(
        eventId,
        "feeDetail _id type registeredCount expected"
      ).exec()
    );
  }

  const results = await Promise.all(promises);

  results.forEach(event => {
    if (!event) {
      throw new Error("Event not found");
    }

    newReceipt.eventIds.push(event._id);
    if (event.type === "early") {
      total = total + Number(event.feeDetail.early);
    }
    if (event.type === "regular") {
      total = total + Number(event.feeDetail.regular);
    }
    if (event.type === "late") {
      total = total + Number(event.feeDetail.late);
    }
  });

  newReceipt.userId = userDetails.id;

  const buffer = await crypto.randomBytesAsync(3);
  newReceipt.payment = {
    type: receiptDetails.payment ? receiptDetails.payment.type : "online",
    transactionId: "ARCS" + buffer.toString("hex"),
    dtxndate: new Date(),
    paid: receiptDetails.payment ? receiptDetails.payment.paid : false,
    amount: total
  };

  const savedReceipt = await newReceipt.save();
  if (bulk) {
    let receipt = await Receipt.findById(savedReceipt._id)
      .populate("userId", "name email")
      .populate("eventIds", "name")
      .exec();
    return { message: "ok", receipt };
  }
  return { message: "ok", receipt: savedReceipt };
};

module.exports.updateCount = async receipt => {
  let promises = [];
  for (const eventId of receipt.eventIds) {
    promises.push(
      Event.findById(
        eventId,
        "feeDetail _id type registeredCount expected"
      ).exec()
    );
  }

  const results = await Promise.all(promises);

  await Promise.all(
    results.map(async event => {
      if (event) {
        event.registeredCount = event.registeredCount + 1;
        if (
          event.registeredCount >= event.expected.early &&
          event.registeredCount <= event.expected.regular &&
          event.type !== "regular"
        ) {
          event.type = "regular";
        }
        if (
          event.registeredCount >= event.expected.regular &&
          event.type !== "late"
        ) {
          event.type = "late";
        }
        return event.save();
      } else {
        throw new Error("Event not found");
      }
    })
  );
  return "ok";
};

module.exports.validate = userDetails => {
  let message = "ok";
  // console.log(userDetails);
  if (!userDetails.contact) {
    return "Enter Mobile Number";
  }
  if (userDetails.contact.length != 10) {
    message = "Phone number is of the required length";
    console.log(message);
    return message;
  }
  if (userDetails.registration) {
    if (!/1[5-8]{1}[A-Z]{3}[0-9]{3}[0-9]$/.test(userDetails.registration)) {
      message = "Reg. No format invalid";
      // console.log("reg");
      return message;
    }
  }
  if (userDetails.memberNo >= 1) {
    console.log(userDetails.memberNo.trim());
    if (!/^9[0-9]{7}$/.test(userDetails.memberNo.trim())) {
      message = "IEEE-Member number not Valid";
      return message;
    }
  }
  let name = userDetails.name.trim();
  if (!/^[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/.test(name)) {
    message = "Name should only have alphabets!";
    return message;
    //  res.render("register",{ message: message });
  }
  if (userDetails.password.length < 8) {
    message = "Password length must be greater than 8 letters ";
    return message;
  }
  return message;
  //  res.render("register", { message: message });
};

module.exports.confirmPayment = async userId => {
  // console.log(userDetails);
  let data = await Receipt.findOne({
    userId: userId,
    payment: { paid: false }
  }).populate("eventIds userId");

  if (!data.emailDetail.sent) {
    data.payment.paid = true;
    let status = await Mail.sendReceiptMail(data);
    await data.save();
    if (!status) {
      return false;
    }
  }
};

//Generates the hash for a string

module.exports.generateHash = password => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(salt_factor), null);
};

//Compares the hash of different string

module.exports.checkPass = async (userId, enteredPass) => {
  let message = "ok";
  let data = await User.findOne({ _id: userId }, "password");
  if (!bcrypt.compareSync(enteredPass, data.password)) {
    message = "U entered the incorrect current password";
    return message;
  } else {
    return message;
  }
};

//updates the hash if the condition is true

module.exports.updatePass = async (userId, password) => {
  let hash = bcrypt.hashSync(password, bcrypt.genSaltSync(salt_factor), null);
  await User.findByIdAndUpdate(userId, { password: hash });
};
