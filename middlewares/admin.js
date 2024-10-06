const jwt = require('jsonwebtoken');
require('dotenv').config();
async function validateAdmin(req, res, next) {
    try {
        let token = req.cookies.token;
        if (!token) return res.redirect("/admin/login");
        const email = await jwt.verify(token, process.env.TOKEN);
        req.user = email;
        next();
    } catch (error) {
        res.send(error.message);
    }
}
module.exports = validateAdmin;