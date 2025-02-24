const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const nodemailer = require('nodemailer'); // for sending OTPs
const crypto = require('crypto'); // for generating OTPs
const dotenv = require('dotenv')
const Razorpay = require('razorpay');

const paymentRouter = require('./routes/payment');
const Users = require('./models/Users');

dotenv.config();

// Configure CORS first, before any routes or middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'auth-token', 'Authorization']
}));

// Then add other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router 
app.use('/api/orders', paymentRouter);

const port = process.env.PORT || 4000;

// Define the schema first
const sellerProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    new_price: { type: Number, required: true },
    size: { type: String, required: true },
    length: { type: Number, required: true },
    chest: { type: Number, required: true },
    shoulder: { type: Number, required: true },
    category: { type: String, required: true },
    images: [{ type: String, required: true }],
    available: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true }
});

// Create the model
const SellerProduct = mongoose.model('SellerProduct', sellerProductSchema);

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sarunsaji2025@mca.ajce.in',
        pass: 'gvdt nhte wird nrqu',
    },
});

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database Connection With MongoDB
mongoose.connect("mongodb+srv://alen:alen123@cluster0.wlq7v.mongodb.net/e-commerce?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("MongoDB connected successfully!");
})
.catch(err => {
  console.error("MongoDB connection error:", err);
});


// Image Storage Engine 
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `/images/${req.file.filename}`
  });
});

// Route for Images folder
app.use('/images', express.static('upload/images'));

// Middleware to fetch user from token
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};

// Schema for creating Product
const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  new_price: { type: Number, required: true, default: 0 },
  old_price: { type: Number, required: true, default: 0 },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});

const Product = mongoose.model("Product", productSchema);

// Add this near your other schemas
const Orders = mongoose.model("Orders", {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  items: [{
    productId: { type: String },
    quantity: Number,
    size: String,
    price: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  orderDate: { type: Date, default: Date.now },
  paymentId: { type: String },
  paymentStatus: { type: String, default: 'Pending', enum: ['Pending', 'Completed', 'Failed'] }
});

// Create new order endpoint
app.post('/create-order', fetchuser, async (req, res) => {
  try {
    const { productId, selectedSize, quantity, totalAmount, shippingAddress } = req.body;
    const userId = req.user.id;

    // Create new order with a temporary payment ID
    const order = new Orders({
      userId,
      items: [{
        productId: String(productId),
        quantity,
        size: selectedSize,
        price: totalAmount
      }],
      totalAmount,
      shippingAddress,
      status: 'Pending',
      paymentStatus: 'Pending',
      paymentId: `TEMP_${Date.now()}` // Add a temporary unique payment ID
    });

    await order.save();

    res.json({ 
      success: true, 
      message: 'Order created successfully',
      orderId: order._id 
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating order",
      error: error.message 
    });
  }
});

// Get all orders (for admin)
app.get('/admin/orders', async (req, res) => {
  try {
    const orders = await Orders.find()
      .populate('userId', 'name email')
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
});

// Get user's orders
app.get('/user/orders', fetchuser, async (req, res) => {
  try {
    const orders = await Orders.find({ userId: req.user.id })
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
});

// Update order status (for admin)
app.put('/admin/order/:orderId', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Orders.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating order" });
  }
});

// ROOT API Route For Testing
app.get("/", (req, res) => {
  res.send("Root");
});

// User Login Endpoint with Secure Password Comparison
app.post('/login', async (req, res) => {
  try {
    let success = false;
    let user = await Users.findOne({ email: req.body.email });

    if (user) {
      if (!user.active) {
        return res.status(403).json({ success: false, errors: "Your account has been blocked." });
      }

      // Compare the entered password with the hashed password in the database
      const passCompare = await bcrypt.compare(req.body.password, user.password);
      if (passCompare) {
        const data = { user: { id: user.id } };
        success = true;
        const token = jwt.sign(data, 'secret_ecom');  // Sign JWT token
        res.json({ success, token });
      } else {
        return res.status(400).json({ success: false, errors: "Incorrect email or password" });
      }
    } else {
      return res.status(400).json({ success: false, errors: "Incorrect email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});


// User Signup Endpoint with Password Hashing
app.post('/signup', async (req, res) => {
  try {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
      return res.status(400).json({ success: false, errors: "User with this email already exists" });
    }

    // Hashing the password before saving
    const salt = await bcrypt.genSalt(10);  // Generate salt for hashing
    const hashedPassword = await bcrypt.hash(req.body.password, salt);  // Hash the password

    // Create default cart data
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }

    // Create the new user with the hashed password
    const user = new Users({
      name: req.body.username,
      email: req.body.email,
      password: hashedPassword,  // Store the hashed password
      cartData: cart,
    });

    // Save the user
    await user.save();
    const data = { user: { id: user.id } };
    const token = jwt.sign(data, 'secret_ecom');  // Sign JWT token
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// Endpoint for getting all products data
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products");
  res.send(products);
});

// Endpoint for getting latest products data
app.get("/newcollections", async (req, res) => {
  let products = await Product.find({});
  let arr = products.slice(0).slice(-8);
  console.log("New Collections");
  res.send(arr);
});

// Endpoint for getting women's products data
app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({ category: "women" });
  let arr = products.splice(0, 4);
  console.log("Popular In Women");
  res.send(arr);
});

// Endpoint for getting related products data
app.post("/relatedproducts", async (req, res) => {
  console.log("Related Products");
  const { category } = req.body;
  const products = await Product.find({ category });
  const arr = products.slice(0, 4);
  res.send(arr);
});

// Create an endpoint for getting cart data of user
app.post('/getcart', fetchuser, async (req, res) => {
  console.log("Get Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);
});

// Create an endpoint for saving the product in cart
app.post('/addtocart', fetchuser, async (req, res) => {
  console.log("Add Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  const { itemId, size } = req.body;
  
  if (!userData.cartData[itemId]) {
    userData.cartData[itemId] = { quantity: 1, size: size };
  } else {
    userData.cartData[itemId].quantity += 1;
    userData.cartData[itemId].size = size;
  }
  
  await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
  res.json(userData.cartData);
});

// Create an endpoint for removing the product from cart
app.post('/removefromcart', fetchuser, async (req, res) => {
  console.log("Remove Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  const { itemId } = req.body;
  
  if (userData.cartData[itemId]) {
    userData.cartData[itemId].quantity -= 1;
    if (userData.cartData[itemId].quantity <= 0) {
      delete userData.cartData[itemId];
    }
  }
  
  await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
  res.json(userData.cartData);
});

// Create an endpoint for adding products using admin panel
app.post("/addproduct", async (req, res) => {
  try {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
      let last_product_array = products.slice(-1);
      let last_product = last_product_array[0];
      id = last_product.id + 1;
    } else { id = 1; }

    // Log the incoming request data for debugging
    console.log("Received product data:", req.body);

    const product = new Product({
      id: id,
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
      category: req.body.category,
      subcategory: req.body.subcategory,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    });

    await product.save();
    console.log("Product saved successfully");
    res.json({ success: true, name: req.body.name });
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).json({ success: false, message: "Error saving product." });
  }
});

// Create an endpoint for removing products using admin panel
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({ success: true, name: req.body.name });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});



// Get All Users for Admin
app.get("/allusers", async (req, res) => {
  try {
    const users = await Users.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users", error });
  }
});

// Toggle User Active Status for Admin
app.post("/toggleuser", async (req, res) => {
  try {
    const user = await Users.findById(req.body.id);
    if (user) {
      user.active = !user.active;
      await user.save();
      res.json({ success: true, message: `User ${user.name} status updated to ${useotr.active ? 'Active' : 'Inactive'}` });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Error toggling user status", error });
  }
});


// Fetch User Profile Endpoint
app.get("/api/profile", fetchuser, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select("-password");  // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
});



// Update User Profile Endpoint
app.post("/api/updateprofile", fetchuser, async (req, res) => {
  try {
    const { name, email, profilePic, currentPassword, newPassword } = req.body;
    
    // Find the user
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.profilePic = profilePic || user.profilePic;

    // If updating password, verify current password and update to new password
    if (currentPassword && newPassword) {
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);  // Hash the new password
    }

    // Save updated user
    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
});


// Search products by name, description, or category
app.get("/search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ success: false, message: "Search query is required" });
  }

  try {
    // Use regex to match the query in name, description, or category fields
    const searchResults = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },  // Case-insensitive search in name
        { description: { $regex: query, $options: "i" } },  // Case-insensitive search in description
        { category: { $regex: query, $options: "i" } }  // Case-insensitive search in category
      ]
    });

    res.json({ success: true, results: searchResults });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ success: false, message: "Error while searching" });
  }
});





















// OTP Management
let OTPs = {};  // To store OTPs temporarily
const OTP_EXPIRY_TIME = 300000; // 5 minutes in milliseconds

// Send OTP
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const user = await Users.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "Email does not exist" });
  }

  // Generate a 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Store OTP in memory with an expiry time
  OTPs[email] = {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_TIME,
  };

  // Send the OTP via email
  const mailOptions = {
    from: 'sarunsaji2025@mca.ajce.in',  // Sender email address
    to: email,  // Receiver email address
    subject: 'Your OTP for Email Verification',
    text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
    res.json({ message: 'OTP sent successfully' });
  });
});

// Verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  const storedOTP = OTPs[email];
  if (!storedOTP) {
    return res.status(400).json({ message: 'OTP not found. Please request a new OTP.' });
  }

  if (storedOTP.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
  }

  if (storedOTP.otp === otp) {
    // OTP is correct
    delete OTPs[email];  // Delete OTP after successful verification
    return res.json({ message: 'OTP verified successfully' });
  } else {
    // OTP is incorrect
    return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });
  }
});

// Reset Password
app.post('/reset-password', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  await Users.updateOne({ email }, { password: hashedPassword });

  // Remove OTP from memory
  delete OTPs[email];

  res.status(200).json({ message: "Password reset successfully" });
});

// Create an endpoint for updating cart item quantity
app.post('/updatecartquantity', fetchuser, async (req, res) => {
  const { itemId, quantity } = req.body;
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    if (userData.cartData[itemId]) {
      userData.cartData[itemId].quantity = quantity;
      if (userData.cartData[itemId].quantity <= 0) {
        delete userData.cartData[itemId]; // Remove item if quantity is 0
      }
    }
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.json(userData.cartData);
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.status(500).json({ success: false, message: "Error updating cart quantity" });
  }
});

// Get product by ID
app.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY, // Ensure this is correct
  key_secret: process.env.RAZORPAY_SECRET, // Ensure this is correct
});

// Handle successful payment
app.post('/payment-success', async (req, res) => {
  const { order_id, payment_id } = req.body;

  // Update the order status in your database
  const order = await Order.findOne({ razorpayOrderId: order_id });
  if (order) {
    order.status = 'Completed';
    await order.save();
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: 'Order not found' });
  }
});








// Add this endpoint to handle product submissions
app.post('/submit-product', fetchuser, async (req, res) => {
    const { name, description, price, size, length, chest, shoulder, category, images } = req.body;

    try {
        // Get user info
        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Create a new product instance
        const newProduct = new SellerProduct({
            name,
            description,
            new_price: Number(price),
            size,
            length: Number(length),
            chest: Number(chest),
            shoulder: Number(shoulder),
            category,
            images,
            available: false,
            userId: user._id,
            userEmail: user.email,
            userName: user.name
        });

        await newProduct.save();
        res.json({ 
            success: true, 
            message: "Product submitted for review successfully." 
        });
    } catch (error) {
        console.error("Error submitting product:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Error submitting product." 
        });
    }
});

// Endpoint to fetch seller requests
app.get('/api/seller-requests', async (req, res) => {
    try {
        // Fetch all products that are not yet approved, sorted by submission date
        const requests = await SellerProduct.find({ available: false })
            .sort({ submittedAt: -1 }); // Most recent first
        
        if (!requests) {
            return res.status(404).json({ 
                success: false, 
                message: "No pending requests found" 
            });
        }
        
        res.json(requests);
    } catch (error) {
        console.error("Error fetching seller requests:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching seller requests." 
        });
    }
});

// Update the accept product endpoint
app.post('/api/accept-product/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await SellerProduct.findByIdAndUpdate(
            id, 
            { available: true },
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        console.error("Error accepting product:", error);
        res.status(500).json({ success: false, message: "Error accepting product" });
    }
});

// Endpoint to reject a product
app.post('/api/reject-product/:id', async (req, res) => {
    const { id } = req.params;
    await SellerProduct.findByIdAndDelete(id); // Remove the product
    res.json({ success: true });
});

// Endpoint to fetch accepted products
app.get('/api/accepted-products', async (req, res) => {
    try {
        const products = await SellerProduct.find({ available: true }); // Fetch products that are approved
        res.json(products);
    } catch (error) {
        console.error("Error fetching accepted products:", error);
        res.status(500).json({ success: false, message: "Error fetching accepted products." });
    }
});

// Add this endpoint for getting user details
app.get('/api/auth/getuser', fetchuser, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ 
      success: true, 
      user: {
        name: user.name,
        email: user.email,
        id: user._id
      }
    });
  } catch (error) {
    console.error('Error in getuser:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user details',
      error: error.message 
    });
  }
});

// Starting Express Server
app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});

// Export the model
module.exports = SellerProduct;















