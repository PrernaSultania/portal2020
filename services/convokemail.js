require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const path = require("path");
const Receipt = require("../models/receipt");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEventDetailMail = async email => {
  try {
    let message = {
      to: email,
      from: "arcs@ieeecsvit.com",
      replyTo: "arcsvit@gmail.com",
      // bcc: "arcs.register@gmail.com",
      subject: "Arcs'19 Event Details",
      html: getMail()
    };
    await sgMail.send(message);
  } catch (err) {
    console.log(err);
  }
};

function getMail() {
  let content = fs
    .readFileSync(path.join(__dirname, "convokemail.html"))
    .toString();
  return content;
}
function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

async function main() {
  let data = fs.readFileSync("convokeList.json");
  data = JSON.parse(data);
  // let testData = [];
  // let data = [];
  // data.push({ email: "priyansh.jain2016@vitstudent.ac.in", name: "pri" });
  for (let elem of data) {
    console.log("sending email to ", elem.name);
    await sendEventDetailMail(elem.email);
    await sleep(500);
  }
}
main();
