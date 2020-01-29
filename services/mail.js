const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const path = require("path");
const Receipt = require("../models/receipt");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports.sendReceiptMail = async data => {
  try {
    let message = {
      to: data.to,
      from: "arcs@ieeecsvit.com",
      replyTo: "arcsvit@gmail.com",
      bcc: "arcs.register@gmail.com",
      subject: "Arcs'19 Registration Receipt",
      text: "Your arcs registration receipt",
      html: getMail(data.name, data.events, data.receiptId, data.amount)
    };
    await sgMail.send(message);
    await Receipt.findByIdAndUpdate(
      data._id,
      {
        emailDetail: {
          sent: true,
          error: null
        }
      },
      {
        new: true
      }
    );
    return true;
  } catch (err) {
    console.log("In mail error handler");
    await Receipt.findByIdAndUpdate(
      data._id,
      {
        emailDetail: {
          sent: false,
          error: err
        }
      },
      {
        new: true
      }
    );
    return false;
  }
};

function getMail(name, events, receiptId, amount) {
  let mailTemplate = fs
    .readFileSync(path.join(__dirname, "registration-mail.html"))
    .toString();
  if (name) {
    mailTemplate = mailTemplate.replace(/{{participant}}/g, name);
  }
  if (events) {
    let eventList = "";
    events.forEach(event => {
      eventList = eventList.concat("<li>" + event.name + "</li>");
    });
    mailTemplate = mailTemplate.replace(/{{events}}/g, eventList);
  }
  if (receiptId) {
    mailTemplate = mailTemplate.replace(/{{receipt_id}}/g, receiptId);
  }
  if (amount) {
    mailTemplate = mailTemplate.replace(/{{amount}}/g, amount);
  }
  return mailTemplate;
}
