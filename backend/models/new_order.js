const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentId: { type: String },
  amount: Number,
  products: [
    {
      productId: { type: String },
      productTitle: String,
      quantity: Number,
      price: Number,
      subTotal: Number,
      image: String,
      size: { type: String, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

OrderSchema.index({ paymentId: 1 }, { unique: false });

module.exports = mongoose.model('NewOrders', OrderSchema);
