const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  cartData: { type: Object, default: {} },
  date: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  profilePic: {
    type: String,  // Stores the URL/path to the profile picture
    default: ''    // Default empty string if no picture
  },
  upiId: {
    type: String,
    default: ''
  },
  document: {
    type: String,
    default: ''
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: '' },
    phone: { type: String, default: '' }  // Added phone field
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
});

const cartDataSchema = {
  quantity: Number,
  size: String
};

const Users = mongoose.model('Users', UserSchema);
module.exports = Users;