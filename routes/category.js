const express = require('express')
const router = express.Router();
const validateAdmin = require('../middlewares/admin');
const {categoryModel,validateCategory} = require('../models/category');

router.post('/create',validateAdmin,async function(req,res){
 try {
    const c = await categoryModel.create({name:req.body.name});
    res.redirect('back')
 } catch (error) {
    res.send(error.message);
 }
});



module.exports = router