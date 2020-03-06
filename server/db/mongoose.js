//-----------------------------------------------------------------------------
// server/db/mongoose.js
//-----------------------------------------------------------------------------
const mongoose = require('mongoose')

mongoose.promise = global.Promise

const db = mongoose.connect(
  process.env.MONGODB_URI || `mongodb://localhost:27017/node-dough-app`,
  {useNewUrlParser: true}
)

// Export the mongoose 
module.exports = mongoose