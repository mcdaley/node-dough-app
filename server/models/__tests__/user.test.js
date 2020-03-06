//-----------------------------------------------------------------------------
// server/models/__tests__/user.test.js
//-----------------------------------------------------------------------------
const mongoose  = require('mongoose')
const expect    = require('chai').expect

const User      = require('../user')

/**
 * User model tests
 */
describe('User', () => {
  describe('Validations', () => {
    it('Requires an email', (done) => {
      let user = new User()

      user.validate( (err) => {
        expect(err.errors.email).to.exist
        expect(err.errors.email.message).to.equal('User email is required')
        done()
      })
    })

    it('Requires a valid phone number', () => {
      let user = new User({email: 'marv@bills.com', phone: '911'})

      user.validate( (err) => {
        expect(err.errors.phone).to.exist
        expect(err.errors.phone.message).to.equal('911 is not a valid phone number')
      })
    })
  })

  describe('Saves to DB', () => {
    // Connect to DB before the tests
    before( function(done) {
      mongoose.connect(
        `mongodb://localhost:27017/node-dough-app`,
        {useNewUrlParser: true}
      )
      const db = mongoose.connection
      db.on('error', console.error.bind(console, 'connection error'))
      db.once('open', () => {
        console.log(`[INFO] Connected to the test database`)
        done()
      })
    })

    it('Saves valid user to DB', (done) => {
      let user = new User({email: 'marv@bills.com', phone: '716-649-1475'})

      user.save( function(err) {
        expect(err).to.not.exist
        done()
      })
    })

    it('Returns an error when saving an invalid User to DB', (done) => {
      let user = new User()
      user.save( function(err) {
        expect(err).to.exist
        done()
      })
    })

    // Disconnect and drop the database
    after( function(done) {
      mongoose.connection.db.dropDatabase( function() {
        mongoose.connection.close(done)
      })
    })
  })
})