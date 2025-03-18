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
const fs = require('fs');

const paymentRouter = require('./routes/payment');
const Users = require('./models/Users');
const NewOrder = require('./models/new_order');

// Import the seller-requests routes
const sellerDataRoutes = require('./routes/seller-data');

dotenv.config();

// Configure CORS first, before any routes or middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Allow any ngrok URL and localhost
    if (origin.includes('ngrok-free.app') || 
        origin.includes('localhost')) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'auth-token', 'Authorization', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Add OPTIONS preflight handler
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, auth-token');
  res.header('Access-Control-Allow-Credentials', true);
  res.sendStatus(200);
});

// Then add other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router 
app.use('/api/orders', paymentRouter);

const port = process.env.PORT || 4000;

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

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
const profilesDir = path.join(uploadDir, 'profiles');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir);
}

// Image Storage Engine 
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

app.post("/upload", upload.array('product', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded."
      });
    }

    // Return array of image URLs
    const imageUrls = req.files.map(file => `/images/${file.filename}`);
    
    res.json({
      success: true,
      image_url: imageUrls[0], // For backward compatibility
      image_urls: imageUrls // Array of all uploaded image URLs
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading files"
    });
  }
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
  images: [{ type: String, required: true }],
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

    // Create new order
    const newOrder = new Orders({
      userId,
      items: [{
        productId,
        quantity,
        size: selectedSize,
        price: totalAmount
      }],
      totalAmount,
      shippingAddress,
    });

    await newOrder.save();
    res.json({ success: true, order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: "Error creating order" });
  }
});

// Get all orders (for admin)
app.get('/api/orders/all-orders', async (req, res) => {
  try {
    const orders = await NewOrder.find()
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching orders" 
    });
  }
});

// Get user's orders
app.get('/api/orders/my-orders', fetchuser, async (req, res) => {
  try {
    const orders = await NewOrder.find({ email: req.user.email })
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching orders" 
    });
  }
});

// Update order status endpoint
app.put('/api/orders/update-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    // Update status for all products in the order
    const updatedOrder = await NewOrder.findByIdAndUpdate(
      orderId,
      { 
        $set: { 
          'products.$[].status': status 
        }
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({ 
      success: true, 
      order: updatedOrder 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating order status' 
    });
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
      images: req.body.images,
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
app.post('/api/auth/updateprofile', fetchuser, async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword, upiId, address } = req.body;
        const userId = req.user.id;

        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update basic info
        if (name) user.name = name;
        if (email) user.email = email;
        
        // Update UPI ID
        if (upiId !== undefined) {
            user.upiId = upiId;
        }

        // Update address including phone number
        if (address) {
            user.address = {
                street: address.street || '',
                city: address.city || '',
                state: address.state || '',
                zipCode: address.zipCode || '',
                country: address.country || '',
                phone: address.phone || ''  // Include phone number
            };
        }

        // Update password if provided
        if (newPassword && currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Current password is incorrect' });
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
        }

        await user.save();

        // Return updated user without password
        const updatedUser = await Users.findById(userId).select('-password');
        res.json({ success: true, user: updatedUser });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Error updating profile' });
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

// Update the Razorpay initialization with your test keys
const razorpay = new Razorpay({
  key_id: 'rzp_test_7qXqryRXwyy9GP',     // Your test key ID
  key_secret: 'wpkyE3JQHW7gFPu5FsK9vX5a'  // Your test key secret
});

// Add this new route for seller payouts
app.post('/api/payment/seller-payout', async (req, res) => {
  try {
    const { amount, upiId, sellerName } = req.body;
    
    if (!amount || !upiId || !sellerName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        upiId: upiId,
        purpose: "Seller Payout",
        sellerName: sellerName
      }
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order,
      key_id: 'rzp_test_7qXqryRXwyy9GP' // Send key_id to frontend
    });
  } catch (error) {
    console.error('Error creating seller payout:', error);
    res.status(500).json({
      success: false,
      message: "Error creating payout",
      error: error.message
    });
  }
});

// Add this route to verify payment
app.post('/api/payment/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", 'wpkyE3JQHW7gFPu5FsK9vX5a')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully"
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid signature sent!"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error!"
    });
  }
});

// Update getuser route
app.get('/api/auth/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await Users.findById(userId).select('-password');
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                date: user.date,
                profilePic: user.profilePic,
                upiId: user.upiId,
                document: user.document,
                documentVerified: user.documentVerified,
                address: {
                    street: user.address?.street || '',
                    city: user.address?.city || '',
                    state: user.address?.state || '',
                    zipCode: user.address?.zipCode || '',
                    country: user.address?.country || '',
                    phone: user.address?.phone || ''  // Added phone field
                }
            }
        });
    } catch (error) {
        console.error('Error in getuser:', error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

// Update the updateproduct endpoint
app.post('/updateproduct', async (req, res) => {
  try {
    const { id, name, category, subcategory, new_price, old_price, images, description } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }

    console.log('Updating product:', id, 'with data:', req.body); // Debug log

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        category,
        subcategory,
        new_price: Number(new_price),
        old_price: Number(old_price),
        images,
        description
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    console.log('Product updated successfully:', updatedProduct); // Debug log

    res.json({ 
      success: true, 
      product: updatedProduct 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating product',
      error: error.message 
    });
  }
});

// Add this route for seller requests
app.post('/api/submit-seller-request', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Create new seller request with user ID and form data
        const sellerRequest = new SellerRequest({
            userId,
            productName: req.body.name, // Match the frontend data structure
            price: req.body.price,
            productDetails: req.body.description,
            category: req.body.category,
            type: req.body.type,
            // Conditionally add size or measurements based on type
            ...(req.body.type === 'tops' && { size: req.body.size }),
            ...(req.body.type === 'bottoms' && {
                waist: req.body.waist,
                length: req.body.length
            }),
            images: req.body.images
        });

        // Save the seller request
        await sellerRequest.save();

        res.json({
            success: true,
            message: 'Seller request submitted successfully',
            requestId: sellerRequest._id
        });

    } catch (error) {
        console.error('Error in submit-seller-request:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// Update the seller requests route
app.get('/api/seller-requests/all', fetchuser, async (req, res) => {
    try {
        // Fetch all requests and populate user details
        const requests = await SellerRequest.find()
            .sort({ createdAt: -1 })
            .populate({
                path: 'userId',
                model: 'Users',
                select: 'name email'
            });
            
        res.json({
            success: true,
            requests: requests.map(request => ({
                _id: request._id,
                productName: request.productName,
                price: request.price,
                productDetails: request.productDetails,
                category: request.category,
                type: request.type,
                size: request.size,
                waist: request.waist,
                length: request.length,
                images: request.images,
                status: request.status,
                adminFeedback: request.adminFeedback,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
                userName: request.userId.name,
                userEmail: request.userId.email
            }))
        });
    } catch (error) {
        console.error('Error fetching seller requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching seller requests'
        });
    }
});

// Add route to update seller request status
app.put('/api/seller-requests/update-status/:requestId', fetchuser, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, adminFeedback } = req.body;
        
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const updatedRequest = await SellerRequest.findByIdAndUpdate(
            requestId,
            { 
                status,
                adminFeedback,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        res.json({
            success: true,
            request: updatedRequest
        });
    } catch (error) {
        console.error('Error updating request status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating request status'
        });
    }
});

// Add this route to get approved seller products
app.get('/api/accepted-products', async (req, res) => {
    try {
        const approvedProducts = await SellerRequest.find({ status: 'approved' })
            .populate('userId', 'name email')
            .sort({ updatedAt: -1 });

        const formattedProducts = approvedProducts.map(product => ({
            id: product._id,
            name: product.productName,
            description: product.productDetails,
            new_price: product.price,
            category: product.category,
            type: product.type,
            size: product.size,
            waist: product.waist,
            length: product.length,
            image: product.images[0], // First image as main image
            images: product.images, // All images
            seller: {
                name: product.userId.name,
                email: product.userId.email
            }
        }));

        res.json({
            success: true,
            products: formattedProducts
        });
    } catch (error) {
        console.error('Error fetching approved products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
});

// Add route to get user's seller requests
app.get('/api/seller-requests/my-requests', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Fetch requests for the specific user
        const requests = await SellerRequest.find({ userId })
            .sort({ createdAt: -1 }); // Newest first
            
        res.json({
            success: true,
            requests: requests.map(request => ({
                _id: request._id,
                productName: request.productName,
                price: request.price,
                productDetails: request.productDetails,
                category: request.category,
                type: request.type,
                size: request.size,
                waist: request.waist,
                length: request.length,
                images: request.images,
                status: request.status,
                adminFeedback: request.adminFeedback,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt
            }))
        });
    } catch (error) {
        console.error('Error fetching user requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your requests'
        });
    }
});

// Configure multer for profile picture uploads
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/profiles')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const profileUpload = multer({ 
    storage: profileStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Serve profile pictures
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads/profiles')));

// Update the profile picture upload endpoint
app.post('/api/upload-profile-pic', fetchuser, profileUpload.single('profilePic'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No file uploaded' 
            });
        }

        // Create the image URL
        const imageUrl = `/uploads/profiles/${req.file.filename}`;

        // Find current user data
        const currentUser = await Users.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user while preserving existing data
        const user = await Users.findByIdAndUpdate(
            req.user.id, 
            {
                $set: {
                    profilePic: imageUrl,
                    // Preserve existing data
                    upiId: currentUser.upiId,
                    address: currentUser.address
                }
            },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            imageUrl: imageUrl,
            user: user
        });

    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading profile picture'
        });
    }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add the seller-requests routes
app.use('/api/seller-data', sellerDataRoutes);

// Add this near other multer configurations
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const documentsDir = './uploads/documents';
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }
    cb(null, documentsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const documentUpload = multer({
  storage: documentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only specific file types
    if (!file.mimetype.match(/^(application\/pdf|image\/(jpeg|png))$/)) {
      return cb(new Error('Only PDF, JPEG, and PNG files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Serve document files
app.use('/uploads/documents', express.static(path.join(__dirname, 'uploads/documents')));

// Update the document upload endpoint
app.post('/api/upload-document', fetchuser, documentUpload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const documentUrl = `/uploads/documents/${req.file.filename}`;

    // Find the current user data first
    const currentUser = await Users.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update only the document fields while preserving all other fields
    const updatedUser = await Users.findByIdAndUpdate(
      req.user.id,
      {
        document: documentUrl,
        documentVerified: false,
        // Preserve existing data
        upiId: currentUser.upiId,
        address: {
          ...currentUser.address,
          phone: currentUser.address?.phone || ''  // Explicitly preserve phone
        }
      },
      { 
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.json({
      success: true,
      documentUrl: documentUrl,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document'
    });
  }
});

// Starting Express Server
app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});















