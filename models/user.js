const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Address Schema
const addressSchema = mongoose.Schema(
    {
        state: {
            type: String,
            minlength: 2,
            maxlength: 50,
        },
        zip: {
            type: Number,
            min: 10000,
            max: 999999,
        },
        city: {
            type: String,
            minlength: 2,
            maxlength: 50,
        },
        address: {
            type: String,
            minlength: 5,
            maxlength: 255,
        },
        longitude: {
            type: Number,
            min: -180,
            max: 180,
        },
        latitude: {
            type: Number,
            min: -90,
            max: 90,
        },
    },
    {
        timestamps: true,
    }
);

// Mongoose User Schema
const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 50,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            default: 'Signed up from Google', // Default password for Google users
        },
        phone: {
            type: Number,
            match: /^[0-9]{10}$/,
        },
        addresses: {
            type: [addressSchema],
            default: [], // Provide an empty array if addresses are not provided
        },  
    },
    {
        timestamps: true,
    }
);
const validateUser = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).default('Signed up from Google'),
        phone: Joi.string().pattern(/^[0-9]{10}$/),
        addresses: Joi.array().items(
            Joi.object({
                state: Joi.string().min(2).max(50),
                zip: Joi.number().min(10000).max(99999),
                city: Joi.string().min(2).max(50),
                address: Joi.string().min(5).max(255),
            })
        ).max(5)
    });

    return schema.validate(data);
};
module.exports = {
    userModel : mongoose.model('user', userSchema),
    validateUser
};