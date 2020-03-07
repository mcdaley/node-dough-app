//-----------------------------------------------------------------------------
// server/models/__tests__/account.test.js
//-----------------------------------------------------------------------------
const mongoose      = require('../../db/mongoose')
const expect        = require('chai').expect
const { ObjectID }  = require('mongodb')

const Account       = require('../account')
const User          = require('../user')

/**
 * Account Model Unit Tests
 */
describe('Account', () => {

  // Test account validation rules
  describe('Validation', () => {
    const user = new User({_id: new ObjectID(), email: 'fergie@bills.com'})

    it('Requires a name', () => {
      let account = new Account()

      account.validate( (err) => {
        expect(err.errors.name).to.exist
        expect(err.errors.name.message).to.match(/name is required/)
      })
    })

    it('Requires a correct account type', () => {
      let account = new Account({name: 'My Checking', type: 'Bad'})

      account.validate( (err) => {
        expect(err.errors.type).to.exist
        expect(err.errors.type).to.match(/not a valid enum value/)
      })
    })

    it('Requires a number for the initial balance', () => {
      let account = new Account({name: 'My Checking', initialBalance: 'Bad'})

      account.validate( (err) => {
        expect(err.errors.initialBalance).to.exist
        expect(err.errors.initialBalance).to.match(/Cast to Number failed/)
      })
    })

    it('Requires an account owner (i.e., userId)', () => {
      let account = new Account({
        name:           'My Checking', 
        initialBalance: '100'
      })

      account.validate( (err) => {
        expect(err.errors.userId).to.exist
        expect(err.errors.userId.message).to.match(/\`userId\` is required/)
      })
    }) 

    it('Validates a correct account', () => {
      let account = new Account({
        name:           'My Checkiing', 
        type:           'Checking', 
        initialBalance: 500.00,
        userId:         user._id,
      })

      account.validate( (err) => {
        expect(err).to.not.exist
      })
    })
  })

  // Test saving account to DB
  describe('Save account to DB', () => {
    
    // Seed the database w/ a user
    const users = [new User({_id: new ObjectID(), email: 'fergie@bills.com'})]
    beforeEach( (done) => {
      User.deleteMany({}).then( () => {
        return User.insertMany(users)
      }).then( () => done())
    })

    it('Fails to save an invalid account to the DB', (done) => {
      let badAccount = new Account()

      badAccount.save( (err) => {
        expect(err).to.exist
        expect(err.errors.name).to.exist
        expect(err.errors.name.message).to.match(/[Nn]ame is required/)
        done()
      })
    })
    
    it('Saves valid account to the DB', (done) => {
      let account = new Account({ 
        name:           'My Checkiing', 
        type:           'Checking', 
        initialBalance: 500.00,
        userId:         users[0]._id,
      })

      account.save( function(err) {
        expect(err).to.not.exist
        done()
      })
    })

    it('Saves valid account and sets the default values', (done) => {
      let account = new Account({
        name:   'Test Checking',
        userId: users[0]._id,
      })

      account
        .save()
        .then( () => {
          Account.findOne({name: 'Test Checking'})
            .then( (result) => {
              expect(result.name).to.equal('Test Checking')
              expect(result.type).to.equal('Checking')
              expect(result.initialBalance).to.equal(0)
              expect(result.userId.toHexString()).to.equal(users[0]._id.toHexString())
              done()
            })
            .catch( (err) => done(err))
        })
        .catch( (err) => done(err) )
    })

    it('Saves valid account w/ parameters', (done) => {
      let account = new Account({
        name:           'Test Savings',
        type:           'Savings',
        initialBalance: 1000,
        userId:         users[0]._id,
      })

      account
        .save()
        .then( () => {
          Account.findOne({name: 'Test Savings'})
            .then( (result) => {
              expect(result.name).to.equal('Test Savings')
              expect(result.type).to.equal('Savings')
              expect(result.initialBalance).to.equal(1000)
              done()
            })
            .catch( (err) => done(err))
        })
        .catch( (err) => done(err))
    })
  
    // Disconnect and drop the database
    after( function(done) {
      mongoose.connection.db.dropDatabase( function() {
        mongoose.connection.close(done)
      })
    })
  })
})