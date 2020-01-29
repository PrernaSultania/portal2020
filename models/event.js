const mongoose = require("mongoose");

const eventSchema = mongoose.Schema({
  name: String,
  feeDetail: {
    early: String,
    regular: String,
    late: String
  },
  description: String,
  registeredCount: Number,
  expected: {
    internal: Number,
    external: Number,
    early: Number,
    regular: Number
  },
  type: {
    type: String,
    enum: ["early", "regular", "late"],
    default: "regular"
  },
  eventScope: {
    type: String,
    enum: ["internal", "external"],
    default: "internal"
  },
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
