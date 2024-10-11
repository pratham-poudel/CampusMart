const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { userModel } = require('../models/user');
const session = require('express-session');
jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const passport = require('passport');
require('dotenv').config();
const { productModel } = require('../models/product');
const { adminModel } = require('../models/admin');








router.get('/', (req, res) => {
    res.redirect('/products');
});
router.get('/map/:orderid', (req, res) => {
    res.render('map', { orderid: req.params.orderid });
});

router.get('/search', async (req, res) => {
    try {
        const searchTerm = req.query.q || ''; // Get search term from query parameter
        const regex = new RegExp(searchTerm, 'i'); // Create a case-insensitive regex

        const products = await productModel.find({
            name: { $regex: regex }
        });
        res.json(products); // Send the results as JSON
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while searching.' });
    }
});
router.get('/search-store', async (req, res) => {
    try {
        const searchTerm = req.query.q || ''; // Get search term from query parameter
        const regex = new RegExp(searchTerm, 'i'); // Create a case-insensitive regex

        const products = await productModel.find({
            name: { $regex: regex }
        }).populate('by');
        console.log(products)
        res.json(products); // Send the results as JSON
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while searching.' });
    }
});


router.get('/store/:id', async (req, res) => {
    try {
        // Convert req.params.id to an ObjectId
        const adminId =new mongoose.Types.ObjectId(req.params.id);

        const resultArray = await productModel.aggregate([
            // Match products belonging to the specific store/admin user
            {
                $match: {
                    by: adminId
                }
            },
            // Group products by category
            {
                $group: {
                    _id: "$category",
                    products: {
                        $push: "$$ROOT"
                    }
                }
            },
            // Project the category and limit the number of products in each category
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    products: { $slice: ["$products", 10] } // Limiting to 10 products per category
                }
            },
            // Sort categories alphabetically
            {
                $sort: { category: 1 }
            }
        ]);

        const store = await adminModel.findById(adminId);
        console.log("Aggregated products:", resultArray);

        // Render the store page
        res.render('store', { store: resultArray, storename: store ? store.storename : 'Store' });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Server Error');
    }
});
router.get('/about',  (req, res) => {
    res.render('about');
});





module.exports = router;