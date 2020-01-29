const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User"
    },
    eventIds: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Event"
        }
      ],
      required: true
    },
    payment: {
      type: {
        type: String,
        default: "online"
      }, // or cash
      transactionId: String,
      dtxndate: Date,
      paid: {
        type: Boolean,
        default: false
      },
      amount: Number,
      online: {
        bankReferenceNumber: String,
        transactionDate: String,
        status: String,
        TPSLTransactionId: String
      }
    },
    emailDetail: {
      sent: {
        type: Boolean,
        default: false
      },
      error: {
        type: Object
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Receipt", receiptSchema);
