const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Category Schema
const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
        unique: true,
    }
}, {
    timestamps: true
});

// Joi Validation Schema
const validateCategory = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required()
    });

    return schema.validate(data);
};

// Mongoose Model


module.exports = {
    categoryModel: mongoose.model('category', categorySchema),
    validateCategory
};
