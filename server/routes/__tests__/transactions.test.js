//-----------------------------------------------------------------------------
// server/routes/__tests__/transactions.test.js
//-----------------------------------------------------------------------------
const expect        = require('chai').expect
const request       = require('supertest')
const { ObjectID }  = require('mongodb')

const { app }       = require('../../../index')
const Transaction   = require('../../models/transaction')
const User          = require('../../models/user')
const Account       = require('../../models/account')

/*
 * Test Data for Transactions API
 */
let usersData = [
  { 
    _id:    new ObjectID(), 
    email:  'fergie@bills.com', 
    phone:  '415-694-2910' 
  },
]

let accountsData = [
  { 
    _id:            new ObjectID(), 
    name:           "Fergie Checking Account", 
    initialBalance: 500,
    userId:         usersData[0]._id,
  },
  { 
    _id:            new ObjectID(), 
    name:           "Joe's Savings Account",   
    type:           'Savings',
    userId:         usersData[0]._id,
  }
]

let transactionsData = [
  {
    _id:            new ObjectID(),
    description:    'Target',
    accountId:      accountsData[0]._id,
    userId:         accountsData[0].userId,
  },
  {
    _id:            new ObjectID(),
    description:    'Haystack Pizza',
    accountId:      accountsData[0]._id,
    userId:         accountsData[0].userId,
  },
  {
    _id:            new ObjectID(),
    description:    'Whole Foods',
    accountId:      accountsData[0]._id,
    userId:         accountsData[0].userId,
  },
]

/*
 * Transactions API Tests
 */
describe('Transactions API', () => {

  // Seed the test data
  beforeEach( async () => {
    try {
      await User.deleteMany({})
      let users   = await User.insertMany(usersData)
  
      await Account.deleteMany({})
      let accounts = await Account.insertMany(accountsData)

      await Transaction.deleteMany({})
      let transactions = await Transaction.insertMany(transactionsData)
    }
    catch(err) {
      console.log(`[ERROR] Failed to create account test data, err= `, err)
    }
  })
  
  /*
   * GET /api/v1/accounts/:accountId/transactions/:id
   */
  describe('GET /api/v1/accounts/:accountId/transactions/:id', () => {
    it('Returns 404 for an invalid account Id', (done) => {
      let invalidAccountId  = 'bad-account-id'
      let transactionId     = transactionsData[1]._id.toHexString()

      request(app)
        .get(`/api/v1/accounts/${invalidAccountId}/transactions/${transactionId}`)
        .expect(404)
        .end(done)
    })

    it('Returns 404 for account Id not in the DB', (done) => {
      let missingAccountId  = new ObjectID().toHexString()
      let transactionId     = transactionsData[1]._id.toHexString()

      request(app)
        .get(`/api/v1/accounts/${missingAccountId}/transactions/${transactionId}`)
        .expect(404)
        .end(done)
    })

    it('Returns 404 for an invalid transaction Id', (done) => {
      let accountId     = accountsData[0]._id.toHexString()
      let invalidTxnId  = 'invalid-txn-id'

      request(app)
        .get(`/api/v1/accounts/${accountId}/transactions/${invalidTxnId}`)
        .expect(404)
        .end(done)
    })

    it('Returns 404 for transaction that is not in DB', (done) => {
      let accountId = accountsData[0]._id.toHexString()
      let txnId     = new ObjectID().toHexString()

      request(app)
        .get(`/api/v1/accounts/${accountId}/transactions/${txnId}`)
        .expect(404)
        .end(done)
    })

    it('Returns the transaction', (done) => {
      let accountId = accountsData[0]._id.toHexString()
      let txnId     = transactionsData[1]._id.toHexString()

      request(app)
        .get(`/api/v1/accounts/${accountId}/transactions/${txnId}`)
        .expect(200)
        .expect( (res) => {
          let {transaction} = res.body
          expect(transaction.description).to.equal(transactionsData[1].description)
          expect(transaction.accountId).to.equal(transactionsData[1].accountId.toHexString())
          expect(transaction.userId).to.equal(usersData[0]._id.toHexString())
        })
        .end(done)
    })
  })

  /*
   * GET /api/v1/accounts/:accountId/transactions
   */
  describe('GET /api/v1/accounts/:accountId/transactions', () => {
    it('Returns 404 for an invalid account ID', (done) => {
      let invalidAccountId = 'bad-account-id'

      request(app)
        .get(`/api/v1/accounts/${invalidAccountId}/transactions`)
        .expect(404)
        .end(done)
    })

    it('Returns all transactions for an account', (done) => {
      let accountId = accountsData[0]._id.toHexString()

      request(app)
        .get(`/api/v1/accounts/${accountId}/transactions`)
        .expect(200)
        .expect( (res) => {
          expect(res.body.transactions.length).to.equal(3)
        })
        .end(done)
    })
  })

  /*
   * POST /api/v1/accounts/:accountId/transactions
   */
  describe('POST /api/v1/accounts/:accountId/transactions', () => {
    const accountId   = accountsData[0]._id.toHexString()
    let   transaction = null
    
    beforeEach( () => {
      transaction = {
        _id:          new ObjectID().toHexString(),
        description:  'Test Transaction',
        amount:       40.25,
        userId:       accountsData[0].userId.toHexString(),
      }
    })

    it('Returns a 400 error if the description is not defined', (done) =>{
      // Remove description from the transaction
      delete transaction.description
      
      request(app)
        .post(`/api/v1/accounts/${accountId}/transactions`)
        .send(transaction)
        .expect(400)
        .end(done)
    })

    it('Returns a 400 error if the userId is not defined', (done) =>{
      // Remove userId from the transaction
      delete transaction.userId

      request(app)
        .post('/api/v1/accounts/${accountId}/transactions')
        .send(transaction)
        .expect(400)
        .end(done)
    })

    it('Creates a transaction', (done) => {
      
      request(app)
        .post(`/api/v1/accounts/${accountId}/transactions`)
        .send(transaction)
        .expect(201)
        .expect( (res) => {
          expect(res.body.description).to.equal(transaction.description)
          expect(res.body.amount).to.equal(transaction.amount)
          expect(res.body.accountId).to.equal(accountId)
          expect(res.body.userId).to.equal(transaction.userId)
        })
        .end( (err, res) => {
          if(err) {
            return done(err)
          }

          Transaction
            .findOne({
              description:  transaction.description, 
              accountId:    accountId
            })
            .then( (result) => {
              expect(result.description).to.equal(transaction.description)
              expect(result.amount).to.equal(result.amount)
              expect(result.accountId.toHexString()).to.equal(accountId)
              expect(result.userId.toHexString()).to.equal(transaction.userId)
              done()
            })
            .catch( (err) => done(err) )
        })
    })
  })

  /*
   * DELETE /api/v1/accounts/:accountId/transactions/:id
   */
  describe('DELETE /api/v1/accounts/:accountId/transactions/:id', () => {
    it('Returns 404 for an invalid account Id', (done) => {
      let invalidAccountId  = 'bad-account-id'
      let transactionId     = transactionsData[1]._id.toHexString()

      request(app)
        .delete(`/api/v1/accounts/${invalidAccountId}/transactions/${transactionId}`)
        .expect(404)
        .end(done)
    })

    it('Returns 404 for account Id not in the DB', (done) => {
      let missingAccountId  = new ObjectID().toHexString()
      let transactionId     = transactionsData[1]._id.toHexString()

      request(app)
        .delete(`/api/v1/accounts/${missingAccountId}/transactions/${transactionId}`)
        .expect(404)
        .end(done)
    })

    it('Returns 404 for an invalid transaction Id', (done) => {
      let accountId     = accountsData[0]._id.toHexString()
      let invalidTxnId  = 'invalid-txn-id'

      request(app)
        .delete(`/api/v1/accounts/${accountId}/transactions/${invalidTxnId}`)
        .expect(404)
        .end(done)
    })

    it('Returns 404 for transaction that is not in DB', (done) => {
      let accountId = accountsData[0]._id.toHexString()
      let txnId     = new ObjectID().toHexString()

      request(app)
        .delete(`/api/v1/accounts/${accountId}/transactions/${txnId}`)
        .expect(404)
        .end(done)
    })

    it('Deletes a transaction', (done) => {
      let accountId = accountsData[0]._id.toHexString()
      let txnId     = transactionsData[1]._id.toHexString()

      request(app)
        .delete(`/api/v1/accounts/${accountId}/transactions/${txnId}`)
        .expect(200)
        .expect( (res) => {
          let txn = res.body.transaction
          expect(txn.description).to.equal(transactionsData[1].description)
          expect(txn.userId).to.equal(transactionsData[1].userId.toHexString())
          expect(txn.accountId).to.equal(transactionsData[1].accountId.toHexString())
        })
        .end( (err, res) => {
          if(err) { return done(err) }

          //* console.log(`[DEBUG] res.body= `, JSON.stringify(res.body, undefined, 2))
          Transaction
            .findById(res.body.transaction._id)
            .then( (result) => {
              expect(result).to.equal(null)
              done()
            })
            .catch( (err) => done )
        })
    })
  })
})
