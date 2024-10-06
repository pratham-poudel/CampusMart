const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Admin Schema
const adminSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Basic email validation
    },
    password: {
        type: String,
        required: true,
        
    },
   
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true
        }
    ],
    storename: {
        type: String,
    },
}, {
    timestamps: true
});

// Joi Validation Schema
const validateAdmin = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().min(5).max(255).required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('SuperAdmin', 'Admin', 'Moderator').required()
    });

    return schema.validate(data);
};

// Mongoose Model


module.exports = {
    adminModel : mongoose.model('admin', adminSchema),
    validateAdmin
};
