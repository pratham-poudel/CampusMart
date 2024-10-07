const express = require('express')
const router = express.Router();
const validateAdmin = require('../middlewares/admin');
const { cartModel, validateCart } = require('../models/cart');
const { userModel } = require('../models/user');

const validateUserAuth = require('../middlewares/user');
const { productModel } = require('../models/product');

router.get('/', validateUserAuth, async function (req, res) {
    try {
        let id = await userModel.findOne({ email: req.user.email });
        let cart = await cartModel.findOne({ user: id._id }).populate('products');
        const resultArray = await productModel.aggregate([
            {
                $sample: { size: 3 } // Randomly selects 3 products
            }
        ]);

        
        let cartDataStructure = {};
        if(cart.products){
            cart.products.forEach(product => {
                let key =product._id.toString();
                if (cartDataStructure[key]) {
                    cartDataStructure[key].quantity++;
                } else {
                    cartDataStructure[key] = {
                        ...product._doc,
                        quantity: 1,
                    };
                }
            });
        }
        let finalarray = Object.values(cartDataStructure);
        
        let finalprice = cart.totalPrice+34;
        if(finalprice-34>199){
            finalprice=finalprice-30;
        }
       

        res.render('cart',{cart:finalarray,finalprice:finalprice,userid:id._id,address:id.addresses[0].address,resultArray});

    } catch (error) {
        res.send(error.message);

    }

});
router.get('/adds/:id', validateUserAuth, async function (req, res) {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        const product = await productModel.findById(req.params.id);
        let cart = await cartModel.findOne({ user: user._id });

        if (!cart) {
            cart = await cartModel.create({
                user: user._id,
                products: [product._id],
                totalPrice: product.price
            });
        } else {
            cart.products.push(product._id);
            cart.totalPrice += product.price;
            await cart.save();
        }

        res.json({ newCount: cart.products.length });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send('An error occurred while adding the product to the cart.');
    }
});
router.get('/add/:id', validateUserAuth, async function (req, res) {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        const product = await productModel.findById(req.params.id);
        let cart = await cartModel.findOne({ user: user._id });

        if (!cart) {
            cart = await cartModel.create({
                user: user._id,
                products: [product._id],
                totalPrice: product.price
            });
        } else {
            cart.products.push(product._id);
            cart.totalPrice += product.price;
            await cart.save();
        }

        res.redirect('back');
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send('An error occurred while adding the product to the cart.');
    }
});
router.get('/remove/:id', validateUserAuth, async function (req, res) {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        const product = await productModel.findById(req.params.id);
        let cart = await cartModel.findOne({ user: user._id });

        if (!cart) {
           return res.status(404).send('There is nothing in the cart to remove.');
        } else {
            const index = cart.products.indexOf(product._id);
            if (index > -1) {
                cart.products.splice(index, 1);
                cart.totalPrice -= product.price;
                await cart.save();
            }
            res.redirect('back');
        }
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).send('An error occurred while removing the product from the cart.');
    }
});



module.exports = router