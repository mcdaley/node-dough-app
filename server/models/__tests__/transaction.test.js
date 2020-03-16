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
      _id:    new ObjectID(), 
      email:  'fergie@bills.com'
    })
    const account = new Account({
      _id:    new ObjectID(), 
      name:   'Validation Account', 
      type:   'Checking',
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

    it('Validates a transaction', () => {
      let transaction = new Transaction({
        description:  'Valid transaction',
        accountId:    account._id,
        userId:       user._id,
      })

      transaction.validate( (err) => {
        expect(err).to.not.exist
      })
    })
  })
})