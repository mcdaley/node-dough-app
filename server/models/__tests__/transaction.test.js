//-----------------------------------------------------------------------------
// server/models/__tests__/transaction.test.js
//-----------------------------------------------------------------------------
const mongoose      = require('../../db/mongoose')
const expect        = require('chai').expect
const { ObjectID }  = require('mongodb')

const Transaction   = require('../transaction')
const Account       = require('../account')
const User          = require('../user')

/*
 * Transaction model tests
 */
describe('Transaction', () => {
  
  // Transaction validation rules
  describe('Validation rules', () => {
    // Create user and account models required for validation tests
    const user    = new User({
      _id:                new ObjectID(), 
      email:              'fergie@bills.com'
    })
    const account = new Account({
      _id:                new ObjectID(), 
      name:               'Validation Account',
      financialInstitute: 'Test Bank',
      type:               'Checking',
    })

    it('Requires a description', () => {
      let transaction = new Transaction()

      transaction.validate( (err) => {
        expect(err.errors.description).to.exist
        expect(err.errors.description.message).to.match(/Description is required/)
      })
    })

    it('Requires an account ID', () => {
      let transaction = new Transaction({ 
        description:  'Missing Account ID',
        userId:       user._id,
      })

      transaction.validate( (err) => {
        expect(err.errors.accountId).to.exist
        expect(err.errors.accountId.message).to.match(/Account is required/)
      })
    })

    it('Requires a user ID (i.e., account owner)', () => {
      let transaction = new Transaction({
        description:  'Missing User ID',
        accountId:    account._id,
      })

      transaction.validate( (err) => {
        expect(err.errors.userId).to.exist
        expect(err.errors.userId.message).to.match(/User is required/)
      })
    })

    it('Requires a valid transaction type (i.e., debit or credit)', () => {
      let invalidTransaction = new Transaction({
        description:  'Invalid transaction type',
        accountId:    account._id,
        userId:       user._id,
        charge:       'BAD',
      })

      invalidTransaction.validate( (err) => {
        expect(err.errors.charge).to.exist
        expect(err.errors.charge.message).to.match(/not a valid enum value/)
      })
    })

    it('Validates a transaction w/ minimum fields', () => {
      let transaction = new Transaction({
        description:  'Valid transaction',
        accountId:    account._id,
        userId:       user._id,
      })

      transaction.validate( (err) => {
        expect(err).to.not.exist
      })
    })

    it('Validates a transaction w/ all fields', () => {
      let transaction = new Transaction({
        description:  'Valid transaction',
        category:     'Groceries',
        charge:       'debit',
        amount:       50.00,
        accountId:    account._id,
        userId:       user._id,
      })

      transaction.validate( (err) => {
        expect(err).to.not.exist
      })
    })
  })
})