render login page after register success

# api

- Get all events
- Register for multiple events at once
- Login
- Register
- Payments

# bugs

-Space bug at name field (fixed)
-page back button bug

# admin

-search participant
-guest care
-export csv
-bulk import
-convoke attendace
-bulk mail script (sendgrid)
-bulk sms script (twilio)

# New Requirements

- After registering directly open profile

## User

- Combo events

  - Event updated addition

  ```javascript
  const mongoose = require("mongoose");

  const eventSchema = mongoose.Schema({
    name: String,
    feeDetail: {
      early: String,
      regular: String,
      late: String
    },
    description: String,
    expected: {
      internal: Number,
      external: Number
    },
    type: [
      { type: String, enum: ["early", "regular", "late"], default: "regular" }
    ],
    comboOrNot: { type: Boolean, default: false },
    comboEventIds: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Event"
        }
      ]
    },

    schedule: String
  });

  module.exports = mongoose.model("Event", eventSchema);
  ```

  - Admin side IEEE verification

  ```javascript
    ieeeDetails: {
        id: String,
        verified: {type: Boolean, default: false}
    }

  ```

  eslint --dry-run ./start.js

//
mongodump --uri=mongodb://akash:abc123@ds040309.mlab.com:40309/arcs-2019 -c=event -o=./eventbackup

mongorestore --

pm2 restart 0

pm2 logs 0 --lines=5000

search bar
view event count
export csv
post attendance

#sms
$data = array('apikey' => $apiKey, 'numbers' => $numbers, "sender" => $sender, "message" => \$message);
{apikey
numbers,
sender=IEEECSVIT
message
test=true
}
url = https://api.txtlocal.com/send/
method = POST
