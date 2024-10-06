const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MongoDbDatabase).then(() => {
  console.log('Connected to the database');
});
module.exports = mongoose;