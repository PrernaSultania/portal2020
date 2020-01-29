const path = require("path");
const Promise = require("bluebird");
const express = require("express");
const request = require("request-promise");
const router = express.Router();
const util = require("../services/mail");
const userFunction = require("../services/userfunction");
const auth = require("../middleware/authentication");
// // const messaging = require(path.join(__dirname, "..", "services", "messaging"));
const Receipt = require(path.join(__dirname, "..", "models", "receipt"));

router
  .route("/pay")
  .get(function getPayment(req, res, next) {
    if (!req.query.id) {
      let error = new Error("Not Found");
      error.status = 404;
      return next(error);
    }
    Receipt.findById(req.query.id)
      .populate("eventIds", "fee")
      .then(function(receipt) {
        if (!receipt) {
          console.log(receipt);
          var error = new Error("Receipt Not Found");
          error.status = 404;
          return next(error);
        } else if (
          receipt.payment.type != "online" ||
          receipt.payment.paid == true
        ) {
          var error = new Error("Unauthorized");
          error.status = 403;
          console.log("online error!!");
          console.log(receipt);
          return next(error);
        } else {
          return res.json({
            success: true,
            receipt: receipt
          });
        }
      })
      .catch(next);
  })
  .post(auth.isLoggedIn, function postRegister(req, res, next) {
    // console.log(req.body);
    if (!req.body.regId) {
      let error = new Error("Unauthorized");
      error.status = 403;
      return next(error);
    }
    Receipt.findById(req.body.regId)
      .populate("eventIds", "fee")
      .populate("userId")
      .then(function(receipt) {
        if (!receipt) {
          var error = new Error("Receipt Not Found");
          error.status = 404;
          return next(error);
        }

        // var total = receipt.eventIds.map(function (e)
        // {
        //     return e.participation.fee;
        // }).reduce(function (x, y)
        // {
        //     return x + y;
        // }, 0);

        let options = {
          insecure: true,
          strictSSL: false,
          agentOptions: {
            rejectUnauthorized: false
          },
          method: "POST",
          url: process.env.PAYMENT_URI,
          uri: process.env.PAYMENT_URI,
          headers: {
            "content-type": "application/x-www-form-urlencoded"
          },
          form: {
            id_trans: receipt.payment.transactionId,
            id_event: process.env.ID_EVENT,
            id_Merchant: process.env.ID_MERCHANT,
            id_Password: process.env.ID_PASSWORD,
            amt_event: receipt.payment.amount,
            id_name: receipt.userId.name
          }
        };
        return request(options);
      })
      .then(function(response) {
        console.log("<><>", response);
        res.render("test", {
          html: response
        });
      })
      .catch(function(err) {
        console.log(err);
        next(err);
      });
  });

router
  .route("/callback")
  .get(function(req, res, next) {
    console.log(req.body);
    return res.json({ message: "callback works!" });
  })
  .post(function(req, res, next) {
    console.log(req.body);
    var refNo = req.body.Refno;
    var amount = req.body.txnamount || 0;
    Promise.try(function() {
      if (refNo.substring(0, 4) == "ARCS")
        return Receipt.findOne({
          "payment.transactionId": req.body.Refno
        })
          .populate("eventIds", "fee name")
          .populate("userId", "name email contact")
          .exec();
    })
      .then(function(receipt) {
        if (!receipt) {
          // no receipt found
          return res.redirect("/payment/failure");
        } else if (
          receipt.payment.type != "online" ||
          receipt.payment.paid ||
          amount < receipt.payment.amount ||
          req.body.status != "0300" ||
          req.body.bankrefno == null ||
          req.body.tpsltranid == null
        ) {
          // payment failed
          return res.redirect("/payment/failure");
        } else {
          receipt.payment.online = {
            bankReferenceNumber: req.body.bankrefno,
            transactionDate: req.body.txndate,
            status: req.body.status,
            amount: req.body.txnamount,
            TPSLTransactionId: req.body.tpsltranid
          };

          return receipt
            .save()
            .then(function() {
              var updatedObject = {
                payment: {
                  paid: true,
                  transactionId: req.body.Refno,
                  amount: req.body.txnamount,
                  type: "online",
                  online: {
                    bankReferenceNumber: req.body.bankrefno,
                    transactionDate: req.body.txndate,
                    status: req.body.status,
                    TPSLTransactionId: req.body.tpsltranid
                  }
                }
              };
              if (refNo.substring(0, 4) == "ARCS")
                return Receipt.findOneAndUpdate(
                  {
                    "payment.transactionId": req.body.Refno
                  },
                  {
                    $set: updatedObject
                  },
                  {
                    new: true
                  }
                );
            })
            .then(function(receipt) {
              return Receipt.findById(receipt._id)
                .populate("eventIds", "feeDetails type name registeredCount")
                .populate("userId", "name email contact")
                .exec();
            })
            .then(async receipt => {
              console.log("receipt", receipt);
              //fetch event
              await userFunction.updateCount(receipt);
              var emailData = {
                to: receipt.userId.email,
                name: receipt.userId.name,
                events: receipt.eventIds,
                receiptId: receipt.payment.transactionId,
                amount: receipt.payment.amount,
                _id: receipt._id.toString()
              };
              console.log("emailData", emailData);
              var smsData = {
                toNumber: receipt.userId.contact,
                content: receipt._id
              };
              await util.sendReceiptMail(emailData);
              // .then(() => messaging.handleSMS(smsData));
            })
            .then(function() {
              return res.redirect("/payment/success");
            })
            .catch(function(err) {
              console.log(err);
              return res.redirect("/payment/failure");
            });
        }
      })
      .catch(function(err) {
        console.log(err);
        return res.redirect("/payment/failure");
      });
  });

router.get("/success", function(req, res, next) {
  res.render("success");
});

router.get("/failure", function(req, res, next) {
  res.render("failure");
});

module.exports = router;
