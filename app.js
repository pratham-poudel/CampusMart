const express = require('express');
const path = require('path');
const app = express();
const passport = require('passport');

const logger = require('morgan');


require('dotenv').config();
require('./config/db');
require('./config/passport');
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const productRouter = require('./routes/product');
const categorieRouter = require('./routes/category');
const userRouter=require('./routes/user')
const cartRouter = require('./routes/cart');
const paymentRouter = require('./routes/payment');
const orderRouter = require('./routes/order');
const deliveryPartnerRouter = require('./routes/deliverypartner');


// Middleware setup
app.use(logger('dev')); // Logger should be set up early
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: "hellohellobyebye"
}));

// Initialize Passport and Passport session
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

// Routes setup
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/products', productRouter);
app.use('/categories', categorieRouter);
app.use('/users',userRouter);
app.use('/cart',cartRouter);
app.use('/payment',paymentRouter);
app.use('/order',orderRouter);
app.use('/deliverypartner',deliveryPartnerRouter);

// View engine setup
app.set('view engine', 'ejs');



// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
