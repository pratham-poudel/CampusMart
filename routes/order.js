const express = require('express');
const { paymentModel } = require('../models/payment');
const router = express.Router();
const { orderModel } = require('../models/order');
const { cartModel } = require('../models/cart');
const Razorpay = require('razorpay');
const { userModel } = require('../models/user');
const deliveryPartnerModel = require('../models/deliveryPartner');
const deliveryModel = require('../models/delivery');

const validateUser = require('../middlewares/user');
router.get('/:userid/:orderid/:paymentid/:signature', validateUser, async (req, res) => {
    let paymentDetails = await paymentModel.findOne({
        orderId: req.params.orderid,
    })
    if (!paymentDetails) {
        return res.send('payment not found')
    }
    if (req.params.signature === paymentDetails.signature && req.params.paymentid === paymentDetails.paymentId) {

        let cart = await cartModel.findOne({
            user: req.params.userid
        });
        let user = await userModel.findOne({ email: req.user.email });





        await orderModel.create({
            orderId: req.params.orderid,
            user: req.params.userid,
            products: cart.products,
            totalPrice: cart.totalPrice,
            address: user.address,
            status: 'Processing',
            payment: paymentDetails._id,

        })
        res.redirect(`/map/${req.params.orderid}`);
    } else {
        return res.send('invalid payment')
    }
});
router.post('/address/:orderid', async (req, res) => {
    let order = await orderModel.findOne({ orderId: req.params.orderid });

    if (!order) {
        return res.send('Order not found');
    }

    const { suggestedAddress, localAddress, location } = req.body;


    // Combine all address components into a single string
    const combinedAddress = `${suggestedAddress}, ${localAddress}, ${location}`;

    // Update the order with the combined address
    order.address = combinedAddress;
    await order.save();

    // Optionally, redirect or send a response
    res.render('completed')
});
router.post('/complete/:orderid', async (req, res) => {
    try {
        let order = await orderModel.findOne({ orderId: req.params.orderid });

        // Check if the order was found
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update the order status
        order.status = 'Packed And Assigned To Delivery Person';
        await order.save();

        // Return a success response
        res.redirect('/admin/vieworders')
    } catch (error) {
        // Handle any unexpected errors
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/cancel/:orderid', async (req, res) => {
    res.send('Cancel Model Called');
});
router.post('/assign/:orderid', async (req, res) => {
    try {
        // Extract order ID from request parameters
        let orderId = req.params.orderid;

        // Find the order and populate the necessary fields
        const order = await orderModel.findOne({ orderId }).populate('user').populate('products');

        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Find available delivery partners
        const boys = await deliveryPartnerModel.find({ status: "active" });
        console.log(boys);

        let assigned = false;

        // Iterate through delivery partners to assign the order
        for (const boy of boys) {
            if (!boy.assigned && !assigned) { // Check if not already assigned
                const delivery = new deliveryModel({
                    order: order._id,
                    deliveryBoy: boy._id,
                    status: "Packed And Assigned To Delivery Person " + boy.name,
                    trackingURL: "http://localhost:3000/track/" + orderId,
                });

                // Save the delivery entry
                await delivery.save();

                // Mark the delivery partner as assigned
                boy.assigned = true;
                await boy.save();

                // Update order status
                order.status = "Your Order is Packed and " + boy.name+ " is assigned to deliver your order";
                await order.save();

                assigned = true;
            }
        }

        if (!assigned) {
            return res.status(400).json({ error: 'No delivery partners available' });
        }

        // Return the updated order
        res.status(200).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
router.get('/tracklivelocation',validateUser,async function(req,res){
    res.render('LiveLocationTracking');
});





module.exports = router;