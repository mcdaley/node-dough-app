//-----------------------------------------------------------------------------
// server/models/transaction.js
//-----------------------------------------------------------------------------
const mongoose  = require('mongoose')

const transactionSchema = new mongoose.Schema({
  description: {
    type:       'String',
    required:   true,
    minlength:  1,
    trim:       true,
  },
  date: {
    type:       Date,
    default:    new Date(),
  },
  category: {
    type:       'String',
  }
})

// Create the Transaction model and export it.
const Transaction = mongoose.model('Transaction', transactionSchema)
module.exports    = Transaction
