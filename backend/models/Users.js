const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  cartData: { type: Object, default: {} },
  date: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
});

const cartDataSchema = {
  quantity: Number,
  size: String
};

module.exports = mongoose.model("Users", UserSchema);