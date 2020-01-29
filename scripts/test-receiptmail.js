const data = { to: 'rajvardhan1999@gmail.com',
   name: 'Rajvardhan Deshmukh',
   events: [{"type":"regular","_id":"5c6bbe6866a57e280e5425f8","name":"test Event","registeredCount":1}],
   receiptId: 'ARCS7c43b9',
   amount: 2 }

const mailReceipt = require("../services/mail.js");
mailReceipt.getMail(data.name, data.events, data.receiptId, data.amount)