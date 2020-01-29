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
      subject: "Arcs'19 Event Details",
      text: "Your registered event details.",
      html: getMail(data)
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

function getMail(data) {
    let content = fs
      .readFileSync(path.join(__dirname, "eventdetails_mail.html"))
      .toString();

      let eventList = "";
      data.forEach(event => {
        eventList = eventList.concat("<h4>" + event.name + "</h4>");
        eventList = eventList.concat(event.description);
        eventList = eventList.concat("<br>");
        eventList = eventList.concat("<li><b>Time: </b>"+event.time+"/li>");
        eventList = eventList.concat("<li><b>Venue:</b>"+event.venue+"</li>");
      });
      content = content.replace(/{{data}}/g, eventList);
    
    return mailTemplate;
  }
  