const User = require("../models/user");
const Receipt = require("../models/receipt");
const GCReceipt = require("../models/gcreceipt");
require("dotenv").config();

/**
 * @function getUsers
 */

module.exports.getUser = async () => {
  let data = await User.find({ role: "public" });
  console.log(data);
  return data;
};

module.exports.GCcheckin = async content => {
  console.log(content.data.checkIn);
  let gcreceipt = new GCReceipt(content.data);
  gcreceipt.userId = content.data.userId;
  gcreceipt.boxId = content.data.boxId;
  gcreceipt.payment.amountPaid = content.data.amountPaid;
  gcreceipt.payment.mode = content.data.mode;
  gcreceipt.payment.paid = true;
  if (content.data.mode === "online") {
    gcreceipt.payment.transactionId = content.data.transactionId;
    gcreceipt.payment.depositAmount = content.data.depositAmount;
    gcreceipt.payment.originalAmount = content.data.originalAmount;
  }
  //let gcreceipt = new GCReceipt(content.data);
  await gcreceipt.save();
  return "ok";
};

module.exports.GCchekout = async data => {
  await GCReceipt.findOneAndUpdate(
    {
      userId: data.userId
    },
    { damage: data.damage }
  );
  return "ok";
};

module.exports.searchRender = async () => {
  // let content = await Receipt.find({ "payment.paid": true }).populate("userId", "name email registration contact");
  let data = await Receipt.find({ "payment.paid": true }).populate(
    "userId",
    "name email registration contact"
  );
  let content = data.map(user => {
    return {
      user: user.toObject().userId
    };
  });
  let newcontent = [];
  for (var i = 0; i < content.length; i++) {
    let uEmail = content[i].user.email;
    console.log(uEmail);
    let check = 0;
    for (var j = 0; j < newcontent.length; j++) {
      if (newcontent[j].email === uEmail) {
        check = 1;
      }
    }
    if (check === 0) {
      newcontent.push(content[i].user);
    }
  }
  return newcontent;
};

module.exports.getAllReceipts = async () => {
  let stuff = await Receipt.find().populate("userId eventIds");
  return stuff;
};

module.exports.flatten = data => {
  let output = data.map(stuff => {
    let eventName = "";
    stuff.eventIds.forEach(name => {
      eventName = name.name + "+" + eventName;
    });
    return {
      "payment.paid": stuff.payment.paid,
      "payment.transactionDate": stuff.payment.online.transactionDate,
      "payment.bankReferenceNumber": stuff.payment.online.bankReferenceNumber,
      "payment.amount": stuff.payment.amount,
      "userId.name": stuff.userId.name,
      "payment.type": stuff.payment.type,
      "payment.transactionId": stuff.payment.transactionId,
      "payment.transactionDate": stuff.payment.online.transactionDate,
      "payment.TPSLTransactionId": stuff.payment.online.TPSLTransactionId,
      "event.name": eventName,
      "userId.email": stuff.userId.email
    };
  });
  return output;
};
/**
 * @function addUser
 * @param {Object}
 */

module.exports.addUser = async userDetails => {
  try {
    let message = "ok";
    let user = await User.findOne({ email: userDetails.email });
    if (user) {
      message = "User already registered";
      return message;
    }
    let newUser = new User(userDetails);
    // if (userDetails.password === process.env.ADMIN_PASS) {
    //   console.log("password matched");
    //   newUser.role = "admin";
    // }
    console.log("A");
    newUser.password = newUser.generateHash(userDetails.password);
    newUser.name = userDetails.name.trim();
    newUser.gender = userDetails.gender.toLowerCase();
    if (userDetails.room) {
      newUser.room = userDetails.room.trim();
    }
    if (userDetails.room) {
      newUser.room = userDetails.room.trim();
    }
    newUser.ieeemember = userDetails.memberNo;
    newUser.contact = userDetails.contact;
    newUser.tShirtSize = userDetails.tShirtSize;
    newUser.ieeeSection = userDetails.section;
    newUser.scope = userDetails.scope;
    newUser.registration = userDetails.registration;
    if (userDetails.university) {
      newUser.university = userDetails.university.trim();
    }
    await newUser.save();
    return message;
  } catch (error) {
    return error.toString();
  }
};

/**
 * @function deleteUser
 * @param {Object}
 */

module.exports.deleteUser = async userDetails => {
  let message = "ok";
  let data = await User.findOne({ email: userDetails });
  if (!data) {
    message = "User not found";
    return message;
  }
  await User.findOneAndDelete({ email: userDetails });
  return message;
};

/**
 * @function updateUser
 * @param {Object}
 */

module.exports.updateUser = async userDetails => {
  let message = "ok";
  let data = await User.findByIdAndUpdate({ $set: userDetails }, { new: true });
  if (!data) {
    message = "User Not Found";
    return message;
  }
  return message;
};

module.exports.searchUser = async userDetails => {
  let data = await User.find({
    $or: [
      { email: userDetails.email },
      { contact: userDetails.contact },
      { name: userDetails.name }
    ]
  });
  return data;
};
