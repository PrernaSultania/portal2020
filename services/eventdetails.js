require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const path = require("path");
const Receipt = require("../models/receipt");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEventDetailMail = async (data, name, email) => {
  try {
    let message = {
      to: email,
      from: "arcs@ieeecsvit.com",
      replyTo: "arcsvit@gmail.com",
      // bcc: "arcs.register@gmail.com",
      subject: "Arcs'19 Event Details",
      html: getMail(data, name)
    };
    console.log(email);
    await sgMail.send(message);
  } catch (err) {
    console.log(err);
  }
};

function getMail(data, name) {
  let content = fs
    .readFileSync(path.join(__dirname, "eventdetails_mail.html"))
    .toString();

  let eventList = "";
  data.forEach(event => {
    eventList = eventList.concat("<h4>" + event.name + "</h4>");
    eventList = eventList.concat(event.description);
    eventList = eventList.concat("<br>");
    eventList = eventList.concat("<li><b>Time: </b>" + event.time + "</li>");
    eventList = eventList.concat("<li><b>Venue:</b>" + event.venue + "</li>");
  });
  content = content.replace(/{{data}}/g, eventList);
  content = content.replace(/{{participant}}/g, name);

  return content;
}
function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}
let data = fs.readFileSync("mailList.json");
data = JSON.parse(data);

const test1 = {
  name: "Priyansh Jain",
  eventData: [
    {
      name: "Machine Learning Workshop",
      time: "28th March, 10AM to 6PM",
      venue: "Homi Baba Gallery (SJT 4th floor Gallery)",
      description:
        "This workshop will provide an insight of Neural Networks Technology and will emphasize on applications of Artificial Neural Networks in real time scenario. Also, the technical issues confronting Neural Networks and its applications will be focused upon."
    }
  ],
  email: "priyansh.jain0246@gmail.com"
};
const test2 = {
  name: "Priyansh Jain",
  eventData: [
    {
      name: "Machine Learning Workshop",
      time: "28th March, 10AM to 6PM",
      venue: "Homi Baba Gallery (SJT 4th floor Gallery)",
      description:
        "This workshop will provide an insight of Neural Networks Technology and will emphasize on applications of Artificial Neural Networks in real time scenario. Also, the technical issues confronting Neural Networks and its applications will be focused upon."
    }
  ],
  email: "priyanshjain412@gmail.com"
};

async function main() {
  // let testData = [];
  data.push(test1);
  for (let elem of data) {
    console.log("sending email to ", elem.name);
    await sendEventDetailMail(elem.eventData, elem.name, elem.email);
    await sleep(500);
  }
}
main();
