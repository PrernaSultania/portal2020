require("dotenv").config();
const mongoose = require("mongoose");
const Receipt = require("../models/receipt");
const Event = require("../models/event");
const User = require("../models/user");
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false },
  async err => {
    if (err) console.log(err);

    const events = await Event.find({
      comboOrNot: true
    }).populate("comboEventIds", "name");
    let comboEvents = {};
    events.forEach(e => {
      comboEvents[e.name] = e.comboEventIds.map(ev => ev.name);
    });

    // if (!err) console.log("Connection successful");
    let receipts = await Receipt.find({ "payment.paid": true })
      .populate("userId eventIds")
      .exec();
    let data = receipts.map(r => {
      return { name: r.userId.name, events: r.eventIds.map(e => e.name) };
    });
    let schedule = {
      "Convoke'19": {
        time: "28th March, 10AM to 6PM",
        venue: "Homi Baba Gallery (SJT 4th floor Gallery)",
        description:
          "A 2-Day Conclave which will give you an opportunity to stand witness to amazing sessions from impactful orators and spell-bounding artists, who have a lot to offer for our future endeavors."
      },
      "Machine Learning Workshop": {
        time: "28th March, 10AM to 6PM",
        venue: "Homi Baba Gallery (SJT 4th floor Gallery)",
        description:
          "This workshop will provide an insight of Neural Networks Technology and will emphasize on applications of Artificial Neural Networks in real time scenario. Also, the technical issues confronting Neural Networks and its applications will be focused upon."
      },

      "Cloud Computing Workshop": {
        time: "29th March, 11AM to 5PM",
        venue: "SJT Smart Classroom (507)",
        description:
          "This workshop will be based on an introduction to Cloud computing covering all the basic concepts and their applications in real development scenarios. Types and Deployment methods of cloud services will be discussed in detail. You are requested to get a visa/mastercard debit card or credit card for account creation(no money will be deducted) and your laptop with you."
      },

      "UI/UX Workshop": {
        time: "27th March 11AM to 7PM",
        venue: "TT VOC Gallery(Ground Floor TT)",
        description:
          "This workshop will guide you through a design-centric approach to user interface and user experience design. You’ll learn current best practices and conventions in UX design industry and apply them by working on real world problems and exercises. You are requested to have Photoshop and XD softwares in your laptop. Kindly bring your laptop with these softwares."
      },

      "Blockchain and Cryptocurrency Workshop": {
        time: "28th March 11AM to 7PM",
        venue: "Kamraj Auditorium (TT 7th floor)",
        description:
          "In this workshop we will explore how blockchains, both public and private, have triggered a global hunt for a frictionless transaction medium as well as discuss the growing importance of blockchain technology in real world applications. You are requested to bring a laptop with you for the workshop."
      },

      "Cyber-Security Workshop": {
        time: "29th March 9AM to 7PM",
        venue: "Homi Bhabha Gallery (SJT 4th Floor Gallery)",
        description:
          "A workshop for all Ethical Hacking Enthusiasts, as we will explore the means that an intruder has available to gain access to computer resources and provide right foundation for using them. You are requested to bring laptop with you for the workshop."
      }
    };
    let mailList = [];
    for (let receipt of data) {
      let finalData = [];
      for (let event of receipt.events) {
        if (Object.keys(comboEvents).indexOf(event) !== -1) {
          // event is a combo
          const comboNames = comboEvents[event];
          for (let comboEvent of comboNames) {
            if (comboEvent === "Convoke'19") continue;
            finalData.push({
              name: comboEvent,
              time: schedule[comboEvent].time,
              venue: schedule[comboEvent].venue,
              description: schedule[comboEvent].description
            });
          }
        } else {
          if (event === "Convoke'19") continue;
          finalData.push({
            name: event,
            time: schedule[event].time,
            venue: schedule[event].venue,
            description: schedule[event].description
          });
        }
      }
      mailList.push({ name: receipt.name, finalData });
    }
    console.log("mail", mailList);
    process.exit(0);
  }
);
