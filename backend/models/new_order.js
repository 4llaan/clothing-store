const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentId: { type: String, required: true },
  amount: { type: Number, required: true },
  products: [
    {
      productId: { type: String, required: true },
      productTitle: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      subTotal: { type: Number, required: true },
      images: [{ type: String }],
      size: { type: String, required: true },
      status: {type: String, default: 'Pending'},
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

OrderSchema.index({ paymentId: 1 }, { unique: false });

module.exports = mongoose.model('NewOrders', OrderSchema);
