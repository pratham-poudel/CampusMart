require('dotenv').config();
const {paymentModel} = require('../models/payment');
const Razorpay = require('razorpay');

const express = require('express');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: 'rzp_test_hXdPUh3IoDNxi3',
	key_secret: '9jqZysk3YfTMebobTR3aQEaC'
});
router.post('/create/orderId', async (req, res) => {
  const amount = req.body.amount * 100; // Convert to smallest currency unit (paise)

  const options = {
      amount: amount, 
      currency: "INR",
  };

  try {
      const order = await razorpay.orders.create(options);
      res.send(order);

      const newPayment = await paymentModel.create({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          status: 'pending',
      });

  } catch (error) {
      res.status(500).send('Error creating order');
  }
});

  
router.post('/api/payment/verify', async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, signature } = req.body;
    const secret = '9jqZysk3YfTMebobTR3aQEaC'
  
    try {
      const { validatePaymentVerification } = require('../node_modules/razorpay/dist/utils/razorpay-utils.js')
  
      const result = validatePaymentVerification({ "order_id": razorpayOrderId, "payment_id": razorpayPaymentId }, signature, secret);
      if (result) {
        const payment = await paymentModel.findOne({ orderId: razorpayOrderId, status: 'pending' });
        payment.paymentId = razorpayPaymentId;
        payment.signature = signature;
        payment.status = 'completed';
        await payment.save();
        res.json({ status: 'success' });
      } else {
        res.status(400).send('Invalid signature');
      }
    } catch (error) {
      console.log(error);
      res.status(500).send('Error verifying payment');
    }
  });
  module.exports = router;
  