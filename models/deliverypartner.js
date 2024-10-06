const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    vehicleType: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        default: 'active'
    },
    assigned:{
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);

module.exports = DeliveryPartner;
