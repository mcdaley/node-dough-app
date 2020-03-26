//-----------------------------------------------------------------------------
// server/routes/transactions.js
//-----------------------------------------------------------------------------
const express       = require('express')
const { ObjectID }  = require('mongodb')

const Transaction     = require('../models/transaction')
const logger          = require('../config/winston')
const { currentUser } = require('../utils/current-user-helper')

// Get the Express Router
const router  = express.Router()

/*
 * GET /v1/accounts/:accountId/transactions/:id
 */
router.get('/v1/accounts/:accountId/transactions/:id', async (req, res) => {
  logger.info(
    'GET /api/v1/accounts/:id/transactions/:id, params= %o', req.params
  )

  let accountId     = req.params.accountId
  let transactionId = req.params.id

  // Verify accountId is a valid ObjectID
  if(!ObjectID.isValid(accountId)) {
    logger.error('Invalid account id=[%s]', accountId)
    return res.status(404).send({
      code:     404,
      message:  'Account not found',
    })
  }

  // Verify transactionId is a valid ObjectID
  if(!ObjectID.isValid(transactionId)) {
    logger.error('Invalid transaction id=[%s]', transactionId)
    return res.status(404).send({
      code:     404,
      message:  'Transaction not found',
    })
  }

  try {
    let user        = await currentUser()
    let transaction = await Transaction.findOne({
      _id:        transactionId,
      accountId:  accountId,
    })

    // Return 404 if transaction is not found.
    if(transaction == null) {
      logger.error(
        'Failed to find transaction id=[%s] w/ account id=[%s]',
        transactionId, accountId
      )
      return res.status(404).send({
        code:     404,
        message:  'Transaction not found',
      })
    }

    logger.info(
      'Retrieved transaction w/ account id=[%s], transaction= %o',
      accountId, transaction
    )
    res.status(200).send({transaction})
  }
  catch(err) {
    logger.error(
      'Failed to retrieve transaction id=[%s] for account id=[%s], error= %o',
      transactionId, accountId, err
    )
    res.status(400).send(err)
  }
})

/*
 * GET /api/v1/accounts/:accountId/transactions
 */
router.get('/v1/accounts/:accountId/transactions', async (req, res) => {
  logger.info(
    'GET /api/v1/accounts/:accountId/transactions, params= %o', req.params
  )
  
  let accountId = req.params.accountId
  
  if(!ObjectID.isValid(accountId)) {
    logger.error('Invalid account id=[%s]', accountId)
    return res.status(404).send({
      code:     404,
      message:  'Account not found',
    })
  }

  try {
    let user          = await currentUser()
    let transactions  = await Transaction.find({accountId: accountId})

    logger.debug(
      'Retrieved [%d] transactions for accountId=[%s], %o', 
      transactions.length, accountId, transactions
    )
    res.status(200).send({transactions})
  }
  catch(err) {
    logger.error(
      'Failed to retrieve transactions for accountId=[%s], error= %o', 
      accountId, err
    )
    res.status(400).send(err)
  }
})

/*
 * POST /api/v1/accounts/:accountId/transactions
 */
router.post('/v1/accounts/:accountId/transactions', async (req, res) => {
  logger.info(
    'POST /api/v1/accounts/:accountId/transactions, params= %o, body= %o', 
    req.params, req.body
  )

  try {
    let user    = await currentUser()

    let transaction = new Transaction({
      description:  req.body.description,
      amount:       req.body.amount || 0,
      date:         req.body.date ? new Date(req.body.date) : new Date(),
      userId:       req.body.userId,
      accountId:    req.params.accountId
    })
    logger.debug('Built transaction= %o', transaction)

    let result = await transaction.save()

    logger.info('Successfully created transaction= %o', result)
    res.status(201).send(result)
  }
  catch(err) {
    logger.error('Failed to save transaction, err= %o', err)
    res.status(400).send(err)
  }
})

/*
 * DELETE /api/v1/accounts/:accountId/transactions/:id
 */
router.delete('/v1/accounts/:accountId/transactions/:id', async (req, res) => {
  logger.info(
    'DELETE /api/v1/accounts/:accountId/transactions, params= %o, body= %o', 
    req.params, req.body
  )

  let accountId     = req.params.accountId
  let transactionId = req.params.id

  // Verify accountId is a valid ObjectID
  if(!ObjectID.isValid(accountId)) {
    logger.error('Invalid account id=[%s]', accountId)
    return res.status(404).send({
      code:     404,
      message:  'Account not found',
    })
  }

  // Verify transactionId is a valid ObjectID
  if(!ObjectID.isValid(transactionId)) {
    logger.error('Invalid transaction id=[%s]', transactionId)
    return res.status(404).send({
      code:     404,
      message:  'Transaction not found',
    })
  }

  // Delete the transaction
  try {
    let user        = await currentUser()
    let transaction = await Transaction.findOneAndDelete({
      _id:        transactionId,
      accountId:  accountId
    })

    // Transaction does not exist in DB
    if(transaction == null) {
      logger.error(
        'Failed to delete transaction id=[%s] for account id=[%s], transaction= %o', 
        transactionId, accountId, transaction
      )
      return res.status(404).send({
        code:     404,
        message:  'Transaction not found'
      })
    }

    logger.info(
      'Deleted transaction id=[%s] for account id=[%s]', 
      transactionId, accountId
    )
    res.status(200).send({transaction})
  }
  catch(err) {
    logger.error(
      'Failed to delete transaction=[%s] for account=[%s], error= %o', 
      transactionId, accountId, err
    )
    res.status(400).send(err)
  }
})

// Export the transactions router
module.exports = router
