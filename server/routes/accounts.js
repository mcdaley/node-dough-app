//-----------------------------------------------------------------------------
// server/routes/accounts.js
//-----------------------------------------------------------------------------
const express     = require('express')

const { Account } = require('../models/account')

const router  = express.Router()

router.get('/accounts', (req, res) => {
  console.log(`[DEUBG] GET /api/accounts`)
  res.send(`GET /api/accounts`)
})

// POST /accounts
router.post('/accounts', (req, res) => {
  console.log(`[INFO] POST /accounts, request body= `, req.body)

  let account = new Account({
    name: req.body.name,
  })
  console.log(`[DEBUG] Account= `, account)

  account.save().then( (doc) => {
    console.log(`[INFO] Saved account to DB`)
    console.log(JSON.stringify(doc, undefined, 2))
    res.send(doc)
  }, (err) => {
    res.status(400).send(err)
  })
})


// Export the accounts router
module.exports = router