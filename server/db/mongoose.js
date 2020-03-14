//-----------------------------------------------------------------------------
// server/db/mongoose.js
//-----------------------------------------------------------------------------
require('../config/config')

const mongoose = require('mongoose')

mongoose.promise = global.Promise
mongoose.set('useFindAndModify', false);

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true }
)

console.log(`[INFO] Connected to DB = `, process.env.MONGODB_URI)

// Export the mongoose 
module.exports = mongoose