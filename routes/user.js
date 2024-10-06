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

            await sendEmail(req.user.email, 'Welcome to Blink it!', `
                <html>
                <p>Hey welcome to blinkit</p>
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