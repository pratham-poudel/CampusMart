const express = require('express')
const router = express.Router();
const validateUserauth = require('../middlewares/user');
const { userModel, validateUser } = require('../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { orderModel } = require('../models/order');
const sendEmail = require('./nodemailer');
router.get('/login', function (req, res) {
    res.render('user_login')
});
router.get('/success', async function (req, res, next) {
    try {
        console.log(req.user.email);
        let user = await userModel.findOne({ email: req.user.email });
        const token = jwt.sign({ email: req.user.email }, process.env.TOKEN);

        if (user) {
            res.cookie("usertoken", token);
            res.redirect('/users/verifyDetails');
        } else {
            const newUser = {
                name: req.user.displayName,
                email: req.user.email,
                password: 'Signed up from Google',
                phone: '', // Optional phone field
                addresses: [], // Default empty addresses
            };

            let createdUser = await userModel.create(newUser);

            res.cookie("usertoken", token);

            await sendEmail(req.user.email, 'Welcome to Campusmart!', `
               <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to CampusMart</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #4CAF50;
            color: white;
            text-align: center;
            padding: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            text-align: left;
            color: #333;
        }
        .content p {
            line-height: 1.6;
        }
        .content a {
            color: #4CAF50;
            text-decoration: none;
        }
        .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            margin-top: 20px;
            border-radius: 4px;
            text-decoration: none;
        }
        .footer {
            text-align: center;
            padding: 10px;
            background-color: #f4f4f4;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Welcome to CampusMart!</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <p>Hey <strong>{{User}}</strong>,</p>
            <p>Welcome to <strong>CampusMart</strong>, your go-to platform for shopping on campus. We are thrilled to have you on board!</p>
            <p>To get started, you can visit our website and explore a wide range of products tailored to your campus needs.</p>
            <a href="https://campusmart-49pp.onrender.com/" class="button">Visit CampusMart</a>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>&copy; 2024 CampusMart. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

            `);

            res.redirect('/users/verifyDetails');
        }
    } catch (error) {
        console.error('Error during success route:', error);
        res.send('An error occurred during login.');
    }
});
router.get('/logout', function (req, res) {
    res.clearCookie('usertoken');
    res.redirect('/users/login');
});
router.get('/verifyDetails', validateUserauth, async function (req, res) {
    try {
        // Extract the email string from req.user object
        const email = req.user.email;

        // Find the user by their email
        const user = await userModel.findOne({ email });

        // Check if essential user details are present
        if (!user.phone || !user.addresses || user.addresses.length === 0) {
            // Render the page to fill in missing details
            res.render('verifyAddress', { user });
        } else {
            // Redirect to products page if all details are present
            res.redirect('/products');
        }
    } catch (error) {
        console.error('Error during verifyDetails route:', error);
        res.status(500).send('An error occurred during address verification.');
    }
});



router.post('/verifyDetails', validateUserauth, async function (req, res) {
    try {
        const { email, phone, state, zip, city, address } = req.body;

       

        // Update the user profile
        const user = await userModel.findOneAndUpdate(
            { email },
            { $set: { phone, addresses: [{ state, zip, city, address }] } },
            { new: true }
        );

        res.redirect('/products');
    } catch (error) {
        console.error('Error during profile update:', error);
        res.status(500).send('An error occurred while updating your profile.');
    }
});
router.get('/tracking',validateUserauth, async function (req, res) {
    const email = req.user.email;
    const user = await userModel.findOne({email});
    const orders = await orderModel.find({ user: user._id }).populate('user').populate('products');

    res.render('trackorder', { orders });  
});
router.get('/trackOrder', validateUserauth, async function (req, res) {
    const email = req.user.email;
    const user = await userModel.findOne({email});
    const orders = await orderModel.find({ user: user._id }).populate('user').populate('products');
    res.json({ orders });
});







module.exports = router