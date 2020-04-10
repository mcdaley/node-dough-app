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
    _id:                new ObjectID(), 
    name:               "Test Checking Account", 
    financialInstitute: 'USAA',
    balance:            500,
    userId:             usersData[0]._id,
  },
  { 
    _id:                new ObjectID(), 
    name:               "Test Credit Card",
    financialInstitute: 'NFCU',
    type:               'Credit Card',
    balance:            -1000,
    userId:             usersData[0]._id,
  }
]

let transactionsData = [
  {
    _id:            new ObjectID(),
    description:    'Target',
    date:           new Date('3/24/2020').toISOString(),
    charge:         'debit',
    amount:         -75.00,
    accountId:      accountsData[0]._id,
    userId:         accountsData[0].userId,
  },
  {
    _id:            new ObjectID(),
    description:    'Haystack Pizza',
    date:           new Date('3/17/2020').toISOString(),
    charge:         'debit',
    amount:         -45.00,
    accountId:      accountsData[0]._id,
    userId:         accountsData[0].userId,
  },
  {
    _id:            new ObjectID(),
    description:    'Whole Foods',
    date:           new Date('3/17/2020').toISOString(),
    amount:         0,
    accountId:      accountsData[0]._id,
    userId:         accountsData[0].userId,
  },
  {
    _id:            new ObjectID(),
    description:    'Opening Balance',
    date:           new Date('3/01/2020').toISOString(),
    category:       'Balance',
    charge:         'credit',
    amount:         500,
    accountId:      accountsData[0]._id,
    userId:         accountsData[0].userId,
  }
]

/*
 * Transactions API Tests
 */
describe('Transactions API', () => {

  // Seed the test data
  beforeEach( async () => {
    try {
      await User.deleteMany({})
      let users = await User.insertMany(usersData)
  
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

    it('Returns array of transactions', (done) => {
      let accountId = accountsData[0]._id.toHexString()
      let txnId     = transactionsData[1]._id.toHexString()

      request(app)
        .get(`/api/v1/accounts/${accountId}/transactions/${txnId}`)
        .expect(200)
        .expect( (res) => {
          let {transaction} = res.body
          expect(transaction.description).to.equal(transactionsData[1].description)
          expect(transaction.date).to.equal(transactionsData[1].date)
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
        .expect( (res) => {
          expect(res.body.code).to.equal(404)
          expect(res.body.message).to.match(/Account not found/)
        })
        .end(done)
    })

    it('Returns 404 for an account not in the DB', (done) => {
      let missingAccountId = new ObjectID().toHexString()

      request(app)
        .get(`/api/v1/accounts/${missingAccountId}/transactions`)
        .expect(404)
        .expect( (res) => {
          expect(res.body.code).to.equal(404)
          expect(res.body.message).to.match(/Account not found/)
        })
        .end(done)
    })

    it('Returns all transactions for an account', (done) => {
      let accountId = accountsData[0]._id.toHexString()

      request(app)
        .get(`/api/v1/accounts/${accountId}/transactions`)
        .expect(200)
        .expect( (res) => {
          expect(res.body.transactions.length).to.equal(4)
        })
        .end(done)
    })

    it('Calculates the running balance', (done) => {
      let accountId = accountsData[0]._id.toHexString()

      request(app)
        .get(`/api/v1/accounts/${accountId}/transactions`)
        .expect(200)
        .expect( (res) => {
          let {transactions}  = res.body
          let runningBalances = [380, 455, 500, 500]

          expect(transactions.length).to.equal(4)
          for(let i = 0; i < transactions.length; ++i) {
            expect(transactions[i].balance).to.equal(runningBalances[i])
          }
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
        charge:       'debit',
        amount:       40.25,
        date:         new Date('3/20/2020').toISOString(),
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

    it('Returns a 404 error for an invalid accountId', (done) => {
      let badAccountId = 'BAD'

      request(app)
        .post(`/api/v1/accounts/${badAccountId}/transactions`)
        .send(transaction)
        .expect(404)
        .expect( (res) => {
          expect(res.body.code).to.equal(404)
          expect(res.body.message).to.equal('Account not found')
        })
        .end(done)
    })

    it('Returns a 404 error if accountId is not found in DB', (done) => {
      let missingAccountId = new ObjectID().toHexString()

      request(app)
        .post(`/api/v1/accounts/${missingAccountId}/transactions`)
        .send(transaction)
        .expect(404)
        .expect( (res) => {
          //* console.log(`[debug] post error response= `, JSON.stringify(res.body, undefined, 2))
          expect(res.body.code).to.equal(404)
          expect(res.body.message).to.match(/Account not found/)
        })
        .end(done)
    })

    it('Creates a debit transaction', (done) => {
      
      request(app)
        .post(`/api/v1/accounts/${accountId}/transactions`)
        .send(transaction)
        .expect(201)
        .expect( (res) => {
          expect(res.body.description).to.equal(transaction.description)
          expect(res.body.amount).to.equal(-1 * transaction.amount)
          expect(res.body.accountId).to.equal(accountId)
          expect(res.body.date).to.equal(transaction.date)
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
              expect(result.amount).to.equal(-1 * Math.abs(transaction.amount))
              expect(result.date.toISOString()).to.equal(transaction.date)
              expect(result.accountId.toHexString()).to.equal(accountId)
              expect(result.userId.toHexString()).to.equal(transaction.userId)
              done()
            })
            .catch( (err) => done(err) )
        })
    })

    it('Creates a credit transaction', (done) => {
      let creditTxn = {...transaction, charge: 'credit', amount: 75.00}
      
      request(app)
        .post(`/api/v1/accounts/${accountId}/transactions`)
        .send(creditTxn)
        .expect(201)
        .expect( (res) => {
          expect(res.body.description).to.equal(creditTxn.description)
          expect(res.body.amount).to.equal(creditTxn.amount)
          expect(res.body.accountId).to.equal(accountId)
          expect(res.body.date).to.equal(creditTxn.date)
          expect(res.body.userId).to.equal(creditTxn.userId)
        })
        .end( (err, res) => {
          if(err) {
            return done(err)
          }

          Transaction
            .findOne({
              description:  creditTxn.description, 
              accountId:    accountId
            })
            .then( (result) => {
              expect(result.description).to.equal(creditTxn.description)
              expect(result.amount).to.equal(creditTxn.amount)
              expect(result.date.toISOString()).to.equal(creditTxn.date)
              expect(result.accountId.toHexString()).to.equal(accountId)
              expect(result.userId.toHexString()).to.equal(creditTxn.userId)
              done()
            })
            .catch( (err) => done(err) )
        })
    })

    it('Creates default debit transaction for an invalid charge and amount', (done) => {
      // Change the charge type from 'debit'
      let badTxn = {...transaction, charge: 'BAD', amount: 'NaN'}

      request(app)
        .post(`/api/v1/accounts/${accountId}/transactions`)
        .send(badTxn)
        .expect(201)
        .expect( (res, err) => {
          if(err) { return done(err) }

          Transaction
            .findOne({
              description:  badTxn.description, 
              accountId:    accountId
            })
            .then( (result) => {
              expect(result.description).to.equal(badTxn.description)
              expect(result.charge).to.equal('debit')
              expect(result.amount).to.equal(0)
              expect(result.date.toISOString()).to.equal(badTxn.date)
              expect(result.accountId.toHexString()).to.equal(accountId)
              expect(result.userId.toHexString()).to.equal(badTxn.userId)
            })
            .catch( (err) => done(err) )
        })
        .end(done)
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
