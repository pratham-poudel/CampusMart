const express = require('express');
const deliveryPartner = require('../models/dpp');
const DeliveryModel = require('../models/delivery');
const { orderModel } = require('../models/order');
const router = express.Router();


// Login Route
router.get('/login', (req, res) => {
    res.render('deliverypartnerregister');
});
router.post('/register', async (req, res) => {
    try {
        const deliveryPartner = new deliveryPartner(req.body);
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
    const order = await orderModel.findOne({orderId:req.params.id});
    order.status = 'Completed';
    await order.save();
    const delivery = await DeliveryModel.findOneAndDelete({ order: order._id });
    const deliveryPartner = await DeliveryPartner.findOne({ email: req.user.email });
    deliveryPartner.assigned = false;
    await deliveryPartner.save();
    res.send('Successfully delivered');
    
});
router.get('/logout', (req, res) => {
    res.clearCookie('deliverytoken');
    res.redirect('/deliverypartner/login');
});

module.exports = router;
