//-----------------------------------------------------------------------------
// server/routes/__tests__/accounts.test.js
//-----------------------------------------------------------------------------
const expect        = require('chai').expect
const request       = require('supertest')
const { ObjectID }  = require('mongodb')

const { app }       = require('../../../index')
const User          = require('../../models/user')
const Account       = require('../../models/account')

/*
 * Create accounts test data
 */
let usersData = [
  { _id: new ObjectID(), email: 'fergie@bills.com', phone: '415-694-2910' },
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

beforeEach( async () => {
  try {
    await User.deleteMany({})
    let users   = await User.insertMany(usersData)

    await Account.deleteMany({})
    let results = await Account.insertMany(accountsData)
  }
  catch(err) {
    console.log(`[ERROR] Failed to create account test data, err= `, err)
  }
})

describe('Accounts', () => {
  /*
   * GET /api/v1/accounts
   */
  describe('GET /api/v1/accounts', () => {
    it('Returns all of the users accounts', (done) => {
      request(app)
        .get('/api/v1/accounts')
        .expect(200)
        .expect( (res) => {
          expect(res.body.accounts.length).to.equal(2)
        })
        .end(done)        
    })
  })

  /*
   * GET /api/v1/accounts/:id
   */
  describe('GET /api/v1/accounts/:id', () => {
    it('Returns the user\'s account w/ id', (done) => {
      let accountId = accountsData[0]._id

      request(app)
        .get(`/api/v1/accounts/${accountId}`)
        .expect(200)
        .expect( (res) => {
          expect(res.body.account.name).to.equal(accountsData[0].name)
          expect(res.body.account.userId).to.equal(accountsData[0].userId.toHexString())
        })
        .end(done)
    })

    it('Returns error for invalid account ID', (done) => {
      request(app)
        .get(`/api/v1/accounts/invalid-id`)
        .expect(404)
        .end(done)
    })

    it('Returns error for account that is not found', (done) => {
      let notFoundId = new ObjectID().toHexString()

      request(app)
        .get(`/api/v1/accounts/${notFoundId}`)
        .expect(404)
        .end(done)
    })
  })

  /*
   * POST /api/v1/accounts
   */
  describe('POST /api/v1/accounts', () => {
    it('Creates an account', (done) => {
      let account = {
        _id:              new ObjectID().toHexString(),
        name:             'Test Credit Card',
        type:             'Credit Card',
        initialBalance:   -750.00,   
        userId:           usersData[0]._id,
      }

      request(app)
        .post('/api/v1/accounts')
        .send(account)
        .expect(200)
        .expect( (res) => {
          expect(res.body.name).to.equal(account.name)
        })
        .end( (err, res) => {
          if(err) {
            return done(err)
          }
          /////////////////////////////////////////////////////////////////////
          // TODO: 03/11/2020
          // - FIGURE OUT HOW TO HANDLE "INITIAL-DATE" FIELD. I SHOULD SWITCH
          //   TO UTC, SECONDS FROM 1970.
          /////////////////////////////////////////////////////////////////////
          Account
            .findOne({name: 'Test Credit Card', userId: account.userId})
            .then( (result) => {
              expect(result.name).to.equal(account.name)
              expect(result.type).to.equal(account.type)
              expect(result.initialBalance).to.equal(account.initialBalance)
              done()
            })
            .catch( (err) => done(err) )
        })
    })
  })

  /*
   * PUT /api/v1/accounts/:id
   */
  describe('PUT /api/v1/accounts/:id', () => {
    it('Returns a 404 status if the account is not found', (done) => {
      let id      = new ObjectID().toHexString()
      let update  = { name: 'ID Not Found' }

      request(app)
        .put(`/api/v1/accounts/${id}`)
        .send(update)
        .expect(404)
        .end(done)
    })
    
    it('Returns an error if the account is invalid', (done) => {
      let id      = 'invalid-account-id'
      let update  = { name: 'Invalid Account ID' }

      request(app)
        .put(`/api/v1/accounts/${id}`)
        .send(update)
        .expect(400)
        .end(done)
    })

    it('Returns error for an invalid account type', (done) => {
      let id      = accountsData[0]._id
      let update  = { type: 'INVALID ACCOUNT TYPE' }

      request(app)
        .put(`/api/v1/accounts/${id}`)
        .send(update)
        .expect(400)
        .end(done)
    })

    it('Ignores extra fields in the request body', (done) => {
      let id      = accountsData[0]._id
      let update  = { name: 'Extra Fields', extra: 'Lorem ipsum'}

      request(app)
        .put(`/api/v1/accounts/${id}`)
        .send(update)
        .expect(200)
        .expect( (res) => {
          expect(res.body.name).to.equal(update.name)
          expect(res.body.extra).to.equal(undefined)
        })
        .end(done)
    })

    it('Updates an account', (done) => {
      let id      = accountsData[0]._id
      let update  = {
        name:           'Updated Savings Account',
        type:           'Savings',
        initialBalance: 2000,
      }

      request(app)
        .put(`/api/v1/accounts/${id}`)
        .send(update)
        .expect(200)
        .expect( (res) => {
          expect(res.body.name).to.equal(update.name)
          expect(res.body.type).to.equal(update.type)
          expect(res.body.initialBalance).to.equal(update.initialBalance)
        })
        .end( (err, res) => {
          if(err) { return done(err) }

          Account
            .findById(id)
            .then( (result) => {
              expect(result.name).to.equal(update.name)
              expect(result.type).to.equal(update.type)
              expect(result.initialBalance).to.equal(update.initialBalance)
              done()
            })
            .catch( (err) => done(err) )
        })
    })
  })

  /*
   * DELETE /api/v1/accounts/:id
   */
  describe('DELETE /api/v1/accounts/:id', () => {
    it('Returns a 404 status if the account is not found', (done) => {
      let id      = new ObjectID().toHexString()

      request(app)
        .delete(`/api/v1/accounts/${id}`)
        .expect(404)
        .end(done)
    })

    it('Returns a 400 error if the account ID is invalid', (done) => {
      let id      = 'invalid-account-id'

      request(app)
        .delete(`/api/v1/accounts/${id}`)
        .expect(400)
        .end(done)
    })

    it('Removes an Account from the DB', (done) => {
      let id = accountsData[0]._id

      request(app)
        .delete(`/api/v1/accounts/${id}`)
        .expect(200)
        .expect( (res) => {
          expect(res.body.name).to.equal(accountsData[0].name)
          expect(res.body.userId).to.equal(accountsData[0].userId.toHexString())
        })
        .end( (err, res) => {
          if(err) { return done(err) }

          Account
            .findById(id)
            .then( (result) => {
              expect(result).to.equal(null)
              done()
            })
            .catch( (err) => done(err) )
        })
    })
  })
})
