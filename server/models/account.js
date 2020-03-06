//-----------------------------------------------------------------------------
// server/models/account.js
//-----------------------------------------------------------------------------
const mongoose = require('mongoose')

// Account schema
const accountSchema = new mongoose.Schema({
  name: {
    type:       String,
    required:   [true, 'Account name is required'],
    minLength:  1,
    trim:       true,
  },
  financialInstitue: {
    type:       String,
    minLength:  1,
    trim:       true,
  },
  type: {
    type:       String,
    enum:       ['Checking', 'Savings', 'Credit Card'],
    default:    'Checking',
  },
  initialBalance: {
    type:       Number,
    min:        0,
    default:    0,
  },
  initialDate: {
    type:       Date,
    default:    new Date(),
  },
  userId: {
    type:       mongoose.Schema.Types.ObjectId,
    required:   true,
  },
})

// Export Account model
const Account   = mongoose.model('Account', accountSchema)
module.exports  = Account
