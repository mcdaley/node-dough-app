//-----------------------------------------------------------------------------
// server/routes/accounts.js
//-----------------------------------------------------------------------------
const express       = require('express')
const { ObjectID }  = require('mongodb')

const User          = require('../models/user')
const Account       = require('../models/account')

/**
 * Temporary method to simulate authenticating a user, which requires that the
 * user w/ email 'fergie@bills.com' is in the development system.
 * 
 * @returns Promise w/ the authenticated user, 'fergie@bills.com'
 */
const authenticateUser = () => {
  return new Promise( (resolve, reject) => {
    User.findOne({email: 'fergie@bills.com'})
      .then( (user) => {
        //* console.log(`[DEBUG] Authenticated user= `, user) 
        resolve(user)  
      })
      .catch( (err) => {
        console.log(`[ERROR] Failed to get user w/ email = fergie@bills.com`, err)
        reject(err)  
      })
  })
}

const router  = express.Router()

/*
 * GET /v1/accounts
 */ 
router.get('/v1/accounts', async (req, res) => {
  console.log(`[INFO] GET /api/v1/accounts`)

  try {
    let user      = await authenticateUser()
    let accounts  = await Account.find({userId: user._id})

    //* console.log(`[INFO] Retrieved accounts for user= `, user._id)
    //* console.log(JSON.stringify(accounts, undefined, 2))

    res.status(200).send({accounts})
  }
  catch(err) {
    console.log(`[ERROR] Failed to find accounts for user=[${user._id}], err= `, err)
    res.status(404).send(err)
  }
})

/*
 * GET /v1/accounts/:id
 */
router.get('/v1/accounts/:id', async (req, res) => {
  const id = req.params.id

  if(!ObjectID.isValid(id)) { 
    return res.status(404).send({error: {code: 404, msg: 'Account not found'}}) 
  }

  try {
    let user    = await authenticateUser()
    let account = await Account.findById(id)

    if(account == null) {
      return res.status(404).send( {error: {code: 404, msg: 'Account not found'}} )
    }

    console.log(`[INFO] Account for id=[${id}], account= `, account)
    res.status(200).send({account})
  }
  catch(err) {
    console.log(`[ERROR] Failed to find account w/ id=[${id}], err= `, err)
    res.status(400).send(err)
  }
})

/*
 * POST /v1/accounts
 */
router.post('/v1/accounts', async (req, res) => {
  console.log(`[INFO] POST/api/v1/accounts, request body= `, req.body)
  try {
    let user    = await authenticateUser()    // Simulate authentication
    let account = new Account({
      name:           req.body.name,
      userId:         user._id,
      type:           req.body.type || 'Checking',
      initialBalance: req.body.initialBalance || '0',
    })
    let doc     = await account.save()
    
    //* console.log(`[INFO] Successfully created account= `, account)
    //* console.log(JSON.stringify(doc, undefined, 2))

    res.status(200).send(doc)
  }
  catch(err) {
    console.log(`[ERROR] Failed to create new account, err`, err)
    res.send(err)
  }
})

/*
 * PUT /v1/accounts/:id
 */
router.put('/v1/accounts/:id', async (req, res) => {
  console.log(`[INFO] PUT /api/v1/account/:id, request body= `, req.body)
  
  let id = req.params.id
  try {
    let user    = await authenticateUser()    // Simulate authentication

    let query   = { _id:  id }
    let update  = req.body
    let options = { new: true, runValidators: true }
    
    let doc     = await Account.findOneAndUpdate(query, update, options)
    
    if(doc == null) {
      return res.status(404).send({
        code: 404,
        msg:  'Account not found'
      })
    }

    console.log(`[INFO] Updated account [${id}]= `, doc)
    res.status(200).send(doc)
  }
  catch(err) {
    console.log(`[ERROR] Failed to update account [${id}], err`, err)
    res.status(400).send(err)
  }
})

/*
 * DELETE /api/v1/accounts/:id
 */
router.delete('/v1/accounts/:id', async (req, res) => {
  console.log(`[INFO] PUT /api/v1/account/:id, request body= `, req.body)
  
  let id = req.params.id

  try {
    let user  = await authenticateUser()
    let doc   = await Account.findByIdAndRemove(id)

    if(doc == null) {
      return res.status(404).send({
        code: 404,
        msg:  'Account not found'
      })
    }

    console.log(`[INFO] Account [${id}]= `, doc)
    res.status(200).send(doc)
  }
  catch(err) {
    console.log(`[ERROR] Failed to delete the account, err= `, err)
    res.status(400).send(err)
  }
})

// Export the accounts router
module.exports = router