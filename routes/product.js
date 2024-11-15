const express = require('express');
const router = express.Router();
const { productModel, validateProduct } = require('../models/product');
const validateAdmin = require('../middlewares/admin');
const upload = require('../config/multerconfig');
const validateUserAuth = require('../middlewares/user');
const { categoryModel, validateCategory } = require('../models/category');
const {cartModel}=require('../models/cart');
const {userModel}=require('../models/user');
const {adminModel}=require('../models/admin');
const {orderModel}=require('../models/order');
router.get('/', validateUserAuth, async function (req, res) {
    try {
        let somethingInCart = false;
        const resultArray = await productModel.aggregate([
            {
                $group: {
                    _id: "$category",
                    products: {
                        $push: "$$ROOT"
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    products: { $slice: ["$products", 10] },
                },
            },
            {
                $sort: { category: 1 } // Sort categories alphabetically
            }
        ]);

        const users = await userModel.findOne({ email: req.user.email });
        const cart = await cartModel.findOne({ user: users._id });
        if (cart && cart.products.length > 0) somethingInCart = true;

        let rnproducts = await productModel.aggregate([{ $sample: { size: 3 } }]);

        const resultObject = resultArray.reduce((acc, item) => {
            acc[item.category] = item.products;
            return acc;
        }, {});

        const ongoingOrders = await orderModel.find({ user: users._id, status: { $ne: 'Completed' } });
        const ongoing = ongoingOrders.length > 0;

        res.render('index', {
            products: resultObject,
            rnproducts,
            somethingInCart,
            cartCount: cart ? cart.products.length : 0,
            users,
            ongoing,
        });
    } catch (error) {
        res.send(error.message);
    }
});

router.get('/viewproducts',  async function (req, res) {
    try {
        const resultArray = await productModel.aggregate([
            {
                $group: {
                    _id: "$category",
                    products: {
                        $push: "$$ROOT"
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    products: { $slice: ["$products", 10] },
                },
            },
            {
                $sort: { category: 1 } // Sort categories alphabetically
            }
        ]);

        

        let rnproducts = await productModel.aggregate([{ $sample: { size: 3 } }]);

        const resultObject = resultArray.reduce((acc, item) => {
            acc[item.category] = item.products;
            return acc;
        }, {});
        
        res.render('viewlogoutproduct', { products: resultObject, rnproducts});
    } catch (error) {
        res.send(error.message);
    }
});

router.post('/', validateAdmin, upload.single("image"), async function (req, res) {
    try {
        let { name, price, category, stock, description, image } = req.body;
        let { error } = validateProduct({ name, price, category, stock, description, image });
        if (error) return res.send(error.message);



        let iscategory = await categoryModel.findOne({ name: category });
        if (!iscategory) {
            await categoryModel.create({ name: category });
        }
        const admin = await adminModel.findOne({ email: req.user.email });


        const created = await productModel.create({
            name,
            price,
            category,
            stock,
            description,
            image: req.file.buffer,
            by: admin._id
        });
         await admin.products.push(created._id);
        await admin.save();
        res.redirect('back');
    } catch (error) {
        res.send(error.message);
    }
});
router.get('/delete/:id', validateAdmin, async function (req, res) {
    try {
        if (req.user.admin) {
            let deleted = await productModel.findByIdAndDelete(req.params.id);
            return res.redirect('/admin/products');
        }
        res.send("You are not allowed to delete any products");


    } catch (error) {
        res.send(error.message);

    }
});
router.post('/delete', validateAdmin, async function (req, res) {
    try {
        if (req.user.admin) {
            let deleted = await productModel.findOneAndDelete({_id:req.body.product_id});
            return res.redirect('/admin/products');
        }
        res.send("You are not allowed to delete any products");


    } catch (error) {
        res.send(error.message);

    }
});
router.get('/update/:id',async function (req, res) {
    const product = await productModel.findById(req.params.id);
    res.render('updateproduct',{product});
});

router.post('/update/:id', validateAdmin, upload.single("image"), async function (req, res) {
    try {
        // Get product ID from request parameters
        const productId = req.params.id;

        // Extract and validate product details
        let { name, price, category, stock, description } = req.body;
        let { error } = validateProduct({ name, price, category, stock, description });
        if (error) return res.send(error.message);

        // Check if the category exists and create it if it doesn't
        let isCategory = await categoryModel.findOne({ name: category });
        if (!isCategory) {
            await categoryModel.create({ name: category });
        }

        // Find the existing product
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Update product details
        product.name = name;
        product.price = price;
        product.category = category;
        product.stock = stock;
        product.description = description;

        // If a new image is uploaded, update the image buffer
        if (req.file) {
            product.image = req.file.buffer;
        }

        // Save the updated product
        await product.save();

        // Redirect back or to a specific route
        res.redirect('/admin/products'); // Redirect to products list or wherever appropriate
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router; // Export the router