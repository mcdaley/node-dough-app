//-----------------------------------------------------------------------------
// server/models/transaction.js
//-----------------------------------------------------------------------------
const mongoose  = require('mongoose')

const transactionSchema = new mongoose.Schema({
  description: {
    type:       String,
    required:   [true, 'Description is required'],
    minlength:  1,
    trim:       true,
  },
  date: {
    type:       Date,
    default:    new Date(),
  },
  category: {
    type:       String,
    default:    '',
  },
  charge: {
    type:       String,
    enum:       ['debit', 'credit'],
    default:    'debit',
  },
  amount: {
    type:       Number,
  },
  accountId: {
    type:       mongoose.Schema.Types.ObjectId,
    required:   [true, 'Account is required'],
  },
  userId: {
    type:       mongoose.Schema.Types.ObjectId,
    required:   [true, 'User is required'],
  },
})

// Create the Transaction model and export it.
const Transaction = mongoose.model('Transaction', transactionSchema)
module.exports    = Transaction
