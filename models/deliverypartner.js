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
    assigned: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Check if the model is already compiled to avoid OverwriteModelError
const DeliveryPartner = mongoose.models.DeliveryPartner || mongoose.model('DeliveryPartner', deliveryPartnerSchema);

module.exports = DeliveryPartner;
