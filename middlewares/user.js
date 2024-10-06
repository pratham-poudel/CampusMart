const jwt = require('jsonwebtoken');
require('dotenv').config();
async function validateUser(req, res, next) {
    try {
        let token = req.cookies.usertoken;
        if (!token) return res.redirect('/users/login');
        const email = await jwt.verify(token, process.env.TOKEN);
        req.user = email;
        next();
    } catch (error) {
        res.send(error.message);
    }
}
module.exports = validateUser;