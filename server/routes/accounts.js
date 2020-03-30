//-----------------------------------------------------------------------------
// server/routes/accounts.js
//-----------------------------------------------------------------------------
const express         = require('express')
const mongoose        = require('mongoose')
const { ObjectID }    = require('mongodb')

const Account         = require('../models/account')
const logger          = require('../config/winston')
const { currentUser } = require('../utils/current-user-helper')

// Get the Express Router
const router  = express.Router()

/*
 * GET /v1/accounts
 */ 
router.get('/v1/accounts', async (req, res) => {
  logger.info(`GET /api/v1/accounts`)

  try {
    let user      = await currentUser()
    let accounts  = await Account.find({userId: user._id})

    logger.info('Retrieved accounts for user= %s', user._id)
    logger.debug('Accounts= %o', accounts)

    res.status(200).send({accounts})
  }
  catch(err) {
    logger.error(`Failed to find accounts for user=[${user._id}], err= %o`, err)
    res.status(404).send(err)
  }
})

/*
 * GET /v1/accounts/:id
 */
router.get('/v1/accounts/:id', async (req, res) => {
  logger.info('GET /api/v1/accounts/%s', req.params.id)
  const id = req.params.id

  if(!ObjectID.isValid(id)) { 
    logger.error('Invalid Account Id=[%s]', id)
    return res.status(404).send({error: {code: 404, msg: 'Account not found'}}) 
  }

  try {
    let user    = await currentUser()
    let account = await Account.findById(id)

    if(account == null) {
      logger.error('Account not found for id=[%s]', id)
      return res.status(404).send( {error: {code: 404, msg: 'Account not found'}} )
    }

    logger.info('Account for userId=[%s], account=[%s]', id, account)
    res.status(200).send({account})
  }
  catch(err) {
    logger.error('Failed to find account w/ userId=[%s], err=[%o]',id, err)
    res.status(400).send(err)
  }
})

/*
 * POST /v1/accounts
 */
router.post('/v1/accounts', async (req, res) => {
  logger.info('POST/api/v1/accounts, request body= %o', req.body)

  try {
    let user    = await currentUser()    // Simulate authentication
    let account = new Account({
      name:               req.body.name,
      userId:             user._id,
      financialInstitute: req.body.financialInstitute,
      initialDate:        req.body.initialDate ? new Date(req.body.initialDate) : new Date(),
      type:               req.body.type    || 'Checking',
      balance:            req.body.balance || '0',
    })
    let doc     = await account.save()
    
    logger.debug('Successfully created account=[%o]`', doc)

    res.status(200).send(doc)
  }
  catch(err) {
    logger.error('Failed to create account, err= %o', err)
    let errorResponse = {}
    let postErrors    = []
    if(err instanceof mongoose.Error.ValidationError) {
      /**
       * Loop through all of the errors and standardize on error format:
       * { code: 7xx, type: '', path: 'form-field, message: ''}
       */
      Object.keys(err.errors).forEach( (formField) => {
        if(err.errors[formField] instanceof mongoose.Error.ValidatorError) {
          postErrors.push({
            code:     701, 
            category: 'ValidationError', 
            ...err.errors[formField].properties
          })
        }
        else if(err.errors[formField] instanceof mongoose.Error.CastError) {
          postErrors.push({
            code:         701,
            category:     'ValidationError', 
            path:         err.errors[formField].path,
            type:         'cast-error',
            value:        err.errors[formField].value,
            shortMessage: err.errors[formField].stringValue,
            message:      err.errors[formField].message,
          })
        }
        else {
          logger.error(`[error] Unknown mongoose.Error.ValidationError err= `, err)
          postErrors.push({code: 799, message: "Unknown mongoose validation error"})
        }
      })
      errorResponse = {errors: postErrors}
    }
    else {
      logger.error(`[error] Failed to create account, err= `, err)
      errorResponse = {errors: err}
    }
    res.status(400).send(errorResponse)
  }
})

/*
 * PUT /v1/accounts/:id
 */
router.put('/v1/accounts/:id', async (req, res) => {
  logger.info('/api/v1/account/%s, request body= %o', req.params.id, req.body)
  
  let id = req.params.id
  try {
    let user    = await currentUser()    // Simulate authentication

    let query   = { _id:  id }
    let update  = req.body
    let options = { new: true, runValidators: true }
    
    let doc     = await Account.findOneAndUpdate(query, update, options)
    
    if(doc == null) {
      logger.warn('Failed to find account w/ id=[%s]', id)
      return res.status(404).send({
        code: 404,
        msg:  'Account not found'
      })
    }

    logger.info('Updated account w/ id=[%s], doc=[%o]', id, doc)
    res.status(200).send(doc)
  }
  catch(err) {
    logger.error('Failed to update account w/ id=[%s], err= %o', id, err)
    res.status(400).send(err)
  }
})

/*
 * DELETE /api/v1/accounts/:id
 */
router.delete('/v1/accounts/:id', async (req, res) => {
  logger.info('PUT /api/v1/account/%s, request= %o', req.params.id, req.body)
  
  let id = req.params.id

  try {
    let user  = await currentUser()
    let doc   = await Account.findByIdAndRemove(id)

    if(doc == null) {
      logger.warn('Failed to find account w/ id=[%s]', id)
      return res.status(404).send({
        code: 404,
        msg:  'Account not found'
      })
    }

    logger.info('Deleted Account w/ id=[%s], doc= %o`', id, doc)
    res.status(200).send(doc)
  }
  catch(err) {
    logger.error('Failed to delete the account w/ id=[%s], err= %o', id, err)
    res.status(400).send(err)
  }
})

// Export the accounts router
module.exports = router