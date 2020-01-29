const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const salt_factor = 8;

const userSchema = mongoose.Schema({
  name: String,
  registration: String, // reg no
  email: {
    type: String,
    unique: true
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: "other"
  },
  room: String,
  contact: Number, // validate ten digits please
  password: String,
  ieeemember: String,
  ieeeSection: String,
  tShirtSize: String,
  role: {
    type: String,
    enum: ["admin", "public", "VIT"],
    default: "public"
  },
  university: {
    type: String,
    default: "VIT University"
  },
  scope: {
    type: String,
    enum: ["internal", "external"],
    default: "internal"
  } // or external
});

userSchema.methods.generateHash = password => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(salt_factor), null);
};

// Mapping of userSchema and reciept and gcreciept Schema via a foreign key yet to be done
// Methods for email and sms script will be added later

module.exports = mongoose.model("User", userSchema);
