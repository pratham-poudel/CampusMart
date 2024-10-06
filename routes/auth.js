const express = require('express');
const router = express.Router();
const { userModel } = require('../models/user');
const jwt = require('jsonwebtoken');
const sendEmail = require('./nodemailer.js');
const passport = require('passport');
const validateAdmin = require('../middlewares/admin.js');
require('dotenv').config();

require('../config/passport');

async function checkToken(req, res, next) {
 try {
  let token = req.cookies.usertoken;
  if(token){
    res.redirect('/users/verifyAddress');
  }else{
    next();
  }
 } catch (error) {
  res.send(error.message);
  
 }
}

// Google OAuth login route
router.get('/google', checkToken, passport.authenticate('google', { scope: ['email', 'profile'] }));

// Google OAuth callback route
router.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/users/success',
  failureRedirect: '/',
}));



// Logout route
router.get('/logout',validateAdmin,function (req, res, next) {

  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
