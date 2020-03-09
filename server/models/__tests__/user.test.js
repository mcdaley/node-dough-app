//-----------------------------------------------------------------------------
// server/models/__tests__/user.test.js
//-----------------------------------------------------------------------------
const expect    = require('chai').expect
const mongoose  = require('mongoose')

const User      = require('../user')

/**
 * User model tests
 */
describe('User', () => {
  describe('Validations', () => {
    it('Requires an email', () => {
      let user = new User()

      user.validate( (err) => {
        expect(err.errors.email).to.exist
        expect(err.errors.email.message).to.equal('User email is required')
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
    /**/
    before( function(done) {
      mongoose.connect(
        process.env.MONGODB_URI,
        { useNewUrlParser: true, useUnifiedTopology: true }
      )
      const db = mongoose.connection
      db.on('error', console.error.bind(console, 'connection error'))
      db.once('open', () => {
        console.log(`[INFO] Connected to the test database`)
        done()
      })
    })
    /**/

    it('Fails to save an invalid user to DB', (done) => {
      let badUser = new User()

      badUser.save( function(err) {
        expect(err.errors.email).to.exist
        expect(err.errors.email.message).to.match(/email is required/)
        done()
      })
    })

    it('Saves valid user to DB', (done) => {
      let user = new User({email: 'avp@bills.com'})

      user.save( function(err) {
        expect(err).to.not.exist
        done()
      })
    })

    it('Saves valid user w/ fields to DB', (done) => {
      let user = new User({email: 'marv@bills.com', phone: '716-649-1475'})

      user
        .save()
        .then( () => {
          User.findOne({email: 'marv@bills.com'})
            .then( (marv) => {
              expect(marv.email).to.equal('marv@bills.com')
              expect(marv.phone).to.equal('716-649-1475')
              done()
            })
            .catch( (err) => done(err) )
        })
        .catch( (err) => done(err) )
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