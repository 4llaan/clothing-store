const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const Order = require('../models/new_order'); // Import your order model
const jwt = require('jsonwebtoken');
const Users = require('../models/Users'); // Import Users model directly

require('dotenv').config();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

// Create order
router.post('/create-order', async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, auth-token, Authorization');

  try {
    const { amount, currency = 'INR' } = req.body;
    
    if (!amount) {
      return res.status(400).json({ 
        success: false, 
        message: "Amount is required" 
      });
    }

    const options = {
      amount: Math.round(amount), // amount in paise
      currency,
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.json({ 
      success: true, 
      order 
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating order",
      error: error.message 
    });
  }
});

// Save order after payment success
router.post('/save', async (req, res) => {
  try {
    const { name, email, phone, address, paymentId, amount, products } = req.body;

    // Create new order
    const newOrder = new Order({
      name,
      email,
      phone,
      address,
      paymentId,
      amount,
      products: products.map(product => ({
        productId: String(product.productId),
        productTitle: product.productTitle,
        quantity: product.quantity,
        price: product.price,
        subTotal: product.subTotal,
        image: product.image,
        size: product.size
      }))
    });

    await newOrder.save();
    
    res.json({ 
      success: true, 
      message: "Order placed successfully!",
      orderId: newOrder._id
    });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error saving order",
      error: error.message 
    });
  }
});

// Update this route to fetch user's orders
router.get('/my-orders', async (req, res) => {
  try {
    const token = req.header('auth-token');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied' });
    }

    const decoded = jwt.verify(token, 'secret_ecom'); // Use the same secret as in fetchuser middleware
    const user = await Users.findById(decoded.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find orders matching the user's email
    const orders = await Order.find({ email: user.email })
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json({ 
      success: true, 
      orders 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching orders',
      error: error.message 
    });
  }
});

// Add this new route to get all orders for admin
router.get('/all-orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json({ 
      success: true, 
      orders 
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching orders',
      error: error.message 
    });
  }
});

module.exports = router;
