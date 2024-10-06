const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Cart Schema
const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

// Joi Validation Schema
const validateCart = (data) => {
    const schema = Joi.object({
        user: Joi.string().required(),
        products: Joi.array().items(Joi.string().required()).min(1).required(),
        totalPrice: Joi.number().min(0).required()
    });

    return schema.validate(data);
};

// Mongoose Model


module.exports = {
    cartModel : mongoose.model('cart', cartSchema),
    validateCart
};