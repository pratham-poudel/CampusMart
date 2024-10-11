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
        
        res.render('index', { products: resultObject, rnproducts, somethingInCart, cartCount: cart ? cart.products.length:0 ,users});
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

module.exports = router; // Export the router