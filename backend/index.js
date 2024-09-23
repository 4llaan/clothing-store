const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multertest = require('multer');
const path = require('path');
const cors = require('cors');

app.use(express.json());
app.use(cors());

// database connection

mongoose.connect("mongodb+srv://alenjames:abaaa@cluster0.avmld.mongodb.net/e-commerce");

//API Creation

app.get("/",(req,res) => {
    res.send("express app is running")
})


// Schema for creating user model


const Users = mongoose.model("Users", {
    name: 
          { type: String },
    email: 
          { type: String, unique: true },
    password: 
          { type: String },
    cartData: 
          { type: Object },
    date: 
          { type: Date, default: Date.now() },
  });
  
  
  // Create an endpoint for login 
  
app.post('/login', async (req, res) => {
  console.log("Login");
  let success = false;
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id
        }
      }
      success = true;
      console.log(user.id);
      const token = jwt.sign(data, 'secret_ecom');
      res.json({ success, token });
    }
    else {
      return res.status(400).json({ success: success, errors: "please try with correct email/password" })
    }
  }
  else {
    return res.status(400).json({ success: success, errors: "please try with correct email/password" })
  }
})


  
  //Create an endpoint for regestring the user


app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
      return res.status(400).json({ success: false, errors: "existing user found with this email" });
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }
    const user = new Users({
      name: req.body.username,
      email: req.body.email,
      password: req.body.password,
      cartData: cart,
    });

    await user.save();
    const data = {
      user: {
        id: user.id
      }
    }
  
    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success:true,token })
  })
  

app.listen(port,(error) => {
    if(!error) {
    console.log("Server is running on port"+port )
    }
    else {
        console.log("error : " +error )
    }})