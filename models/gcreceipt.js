const mongoose = require("mongoose");

const gcreceiptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User"
    },
    boxId: {
      type: String,
      required: true,
      default: ""
    },
    checkIn: {
      type: String
    },
    checkOut: {
      type: String
    },
    payment: {
      depositAmount: Number,
      transactionId: String,
      originalAmount: Number, // amount generated by frontend depending on stay
      mode: {
        type: String,
        enum: ["offline", "online"],
        default: "offline"
      },
      paid: {
        type: Boolean,
        default: false
      },
      amountPaid: Number
    },
    damage: Boolean
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("GCReceipt", gcreceiptSchema);
