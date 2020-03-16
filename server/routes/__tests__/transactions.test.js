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
  describe('POST /api/v1/transactions', () => {
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

    /**/
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
    /**/
  })
})
