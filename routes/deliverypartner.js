const express = require('express');
const DeliveryPartner = require('../models/dpp');
const DeliveryModel = require('../models/delivery');
const { orderModel } = require('../models/order');
const router = express.Router();
const sendEmail = require('./nodemailer');


// Login Route
router.get('/login', (req, res) => {
    res.render('deliverypartnerregister');
});
router.post('/register', async (req, res) => {
    try {
        const deliveryPartner = new DeliveryPartner(req.body);
        await deliveryPartner.save();
        const token = jwt.sign({ email: req.body.email }, process.env.TOKEN);
        res.cookie("deliverytoken", token);
        res.redirect('/deliverypartner/dashboard');
    } catch (error) {
        res.status(400).send('Error registering delivery partner');
    }
});
function validateDeliveryPartner(req, res, next) {
    jwt.verify(req.cookies.deliverytoken, process.env.TOKEN, (err, decoded) => {
        if (err) {
            res.redirect('/deliverypartner/login');
        } else {
            req.user = decoded;
            next();
        }
    });
}
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const deliveryPartner = await DeliveryPartner.findOne({ email });
        
        if (!deliveryPartner) {
            return res.status(400).send('Invalid email or password');
        }

        // Compare the password directly
        if (deliveryPartner.password !== password) {
            return res.status(400).send('Invalid email or password');
        }
        const token = jwt.sign({ email: email }, process.env.TOKEN);
        res.cookie("deliverytoken", token);
        // Successful login
        res.redirect('/deliverypartner/dashboard'); // Replace with actual dashboard route
    } catch (error) {
        res.status(400).send('Error logging in');
    }
});
router.get('/dashboard',validateDeliveryPartner ,async (req, res) => {
    
    const deliveryPartner = await DeliveryPartner.findOne({ email:req.user.email });
    const assignedOrders = await DeliveryModel.find({ deliveryBoy: deliveryPartner._id })
  .populate({
    path: 'order', // Populate the 'order' field in DeliveryModel
    populate: {
      path: 'user', // Populate the 'paymentStatus' field inside the 'OrderModel'
    }
  });
//   console.log(assignedOrders);
    res.render('deliverydashboard', { deliveryPartner, assignedOrders });
    
    
});
router.post('/complete/:id',validateDeliveryPartner, async (req, res) => {
    const order = await orderModel.findOne({orderId:req.params.id}).populate('user');
    order.status = 'Completed';
    await order.save();
    const delivery = await DeliveryModel.findOneAndDelete({ order: order._id });
    const deliveryPartner = await DeliveryPartner.findOne({ email: req.user.email });
    deliveryPartner.assigned = false;
    await deliveryPartner.save();
    res.send('Successfully delivered');
    await sendEmail(order.user.email, 'Thank You for Your Purchase!', `
        <html>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #4CAF50;">Thank You for Shopping with CampusMart!</h2>
                        <p>Dear ${order.user.name},</p>
                        <p>We appreciate your recent purchase from CampusMart. Your order <strong>#${order.orderId}</strong> has been successfully delivered!</p>
                        <p>We hope you enjoy your purchase. Feel free to explore more products on our website:</p>
                        <a href="https://campusmart-49pp.onrender.com/" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Visit CampusMart</a>
                        <p>Thank you for choosing CampusMart!</p>
                        <p>&copy; 2024 CampusMart</p>
                    </div>
                </body>
            </html>
    `);
});
router.get('/logout', (req, res) => {
    res.clearCookie('deliverytoken');
    res.redirect('/deliverypartner/login');
});

module.exports = router;
