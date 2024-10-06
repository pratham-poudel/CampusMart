const mongoose = require('mongoose');
// Mongoose Delivery Schema
const deliverySchema = mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order',
        required: true
    },
    deliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryPartner',
        required: true
    },
    status: {
        type: String,
        
    },
    trackingURL: {
        type: String,
       
    },
    estimatedDeliveryTime: {
        type: Number,
        min: 0 // Assuming delivery time is in minute
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('delivery', deliverySchema);



