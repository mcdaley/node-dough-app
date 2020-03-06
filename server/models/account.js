//-----------------------------------------------------------------------------
// server/models/account.js
//-----------------------------------------------------------------------------
const mongoose = require('mongoose')

let Account = mongoose.model('Account', {
  name: {
    type:       String,
    required:   true,
    minLength:  1,
    trim:       true,
  },
  accountType: {
    type:       String,
    enum:       ['Checking', 'Saving', 'Credit Card'],
    default:    'Checking',
  },
  initialBalance: {
    type:       Number,
    min:        0,
    default:    0,
  }
})

module.exports = { Account }
