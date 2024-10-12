const express = require('express');
const router = express.Router();
const { adminModel } = require('../models/admin');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const validateAdmin = require('../middlewares/admin');
const { validateUser } = require('../models/user');
const { productModel } = require('../models/product');
const {categoryModel} = require('../models/category');
const {orderModel} = require('../models/order');

if (
    typeof process.env.NODE_ENV !== undefined && process.env.NODE_ENV === "DEVELOPMENT"
) {
   
router.post('/create', async function (req, res) {
    try {
        const { name, email, password, storename } = req.body;

        // Create the admin account
        const admin = await adminModel.create({
            name: name,
            email: email,
            password: password,
            storename: storename
        });

        // Save the admin to the database
        await admin.save();

        // Generate JWT token for authentication
        let token = jwt.sign({ email: admin.email, admin: true }, process.env.TOKEN);

        // Send back the token as a cookie
        res.cookie('token', token);
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).send(error.message);
    }
});
}
router.get("/login", function (req, res) {
    res.render('admin_login')
})
router.get("/signup", function (req, res) {
    res.render('create-store')
})
router.post("/login", async function (req, res) {
    let { email, password } = req.body;
    const admin = await adminModel.findOne({ email });
    if (!admin) {
        res.send("Admin not found");
    } else {
        if (admin.password === password) {
            let token = jwt.sign({ email: admin.email ,admin:true}, process.env.TOKEN);
            res.cookie('token', token);
            res.redirect('/admin/dashboard');
        } else {
            res.send("Password incorrect");
        }
    }
})
router.get("/dashboard", validateAdmin, async function (req, res) {
    const prodcount = await productModel.countDocuments();
    const categcount = await categoryModel.countDocuments();
    const ordercount = await orderModel.countDocuments({ status: { $ne: 'Completed' } });

    const email = req.user;
    res.render('admin_dashboard',{prodcount,categcount,ordercount});
});
router.get("/products", validateAdmin, async function (req, res) {
    try {
        // Fetch admin and populate products
        const admin = await adminModel.findOne({ email: req.user.email }).populate('products');
        
        // If no products, render with an empty object
        if (!admin || !admin.products || admin.products.length === 0) {
            return res.render('admin_products', { products: {} });
        }

        // Aggregate products by category
        const productsByCategory = admin.products.reduce((acc, product) => {
            const category = product.category;
            
            // Initialize category if it doesn't exist
            if (!acc[category]) {
                acc[category] = [];
            }
            
            // Push the product into its category group
            acc[category].push(product);
            
            return acc;
        }, {});

        // Limit products to 10 per category
        Object.keys(productsByCategory).forEach((category) => {
            productsByCategory[category] = productsByCategory[category].slice(0, 10);
        });

        // Send the result as an object
        res.render('admin_products', { products: productsByCategory });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Server Error');
    }
});

router.get("/vieworders", validateAdmin, async function (req, res) {
    try {
        const orders = await orderModel.find({ status: { $ne: 'Completed' } }).populate('user').populate('products');
        console.log(orders);
        res.render('vieworders', { orders });  
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("An error occurred while fetching orders.");
    }
});




router.get("/logout", validateAdmin, function (req, res) {
    res.clearCookie('token');
    res.redirect('/admin/login');
});
module.exports = router;