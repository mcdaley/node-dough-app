//-----------------------------------------------------------------------------
// server/routes/transactions.js
//-----------------------------------------------------------------------------
const express         = require('express')
const mongoose        = require('mongoose')
const { ObjectID }    = require('mongodb')

const Transaction     = require('../models/transaction')
const Account         = require('../models/account')
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

  /**
   * Calculate the running balance for all of the transactions in the account
   * and return the updated array of transactions w/ the running balance for
   * each transaction.
   * 
   * The calculation assumes the transactions are returned sorted by
   * descending date order.
   * 
   * @param   {object} account 
   * @param   {array} transactions
   * @returns Array of transactions w/ running balance for each transaction.
   */
  function runningBalance(account, transactions) {
    let rear                   = transactions.length - 1
    transactions[rear].balance = transactions[rear].amount

    for(let i = rear - 1; i >= 0; --i) {
      transactions[i].balance  = transactions[i+1].balance + transactions[i].amount
    }

    return transactions
  }

  /////////////////////////////////////////////////////////////////////////////
  // TODO: 04/07/2020
  // NEED TO ENSURE THE USER CAN ONLY RETURN TRANSACTIONS FOR AN ACCOUNT
  // THAT THE USER OWNS. WILL NEED TO IMPLEMENT THIS FEATURE WHEN I ADD
  // AUTHENTICATION.
  /////////////////////////////////////////////////////////////////////////////
  
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

    // SEE THE ABOVE TODO ABOUT ADDING A CHECK FOR THE USER!
    let account = await Account.findOne({
      _id:      accountId,
      //* userId:   userId,
    })

    if(account == null) {
      logger.error('User id=[%s] trying access account id=[%s]', user._id, accountId)
      return res.status(404).send({
        code:     404,
        message:  'Account not found'
      })
    }

    let transactions = await Transaction.find({accountId: accountId}).sort({ date: -1})
    transactions     = runningBalance(account, transactions)

    logger.debug('Transactions w/ balance= [%o]', transactions)

    logger.debug(
      'Retrieved [%d] transactions for accountId=[%s], %o', 
      transactions.length, accountId, transactions
    )
    res.status(200).send({account, transactions})
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

  /////////////////////////////////////////////////////////////////////////////
  // TODO: 04/07/2020
  // I WILL NEED TO CLEANUP THE LOGIC FOR USING THE USER-ID. RIGHT NOW, THE
  // USER-ID IS REQUIRED IN THE API CALL. IN THE FUTURE, I WILL BE ABLE TO
  // GET THE USER-ID FROM THE AUTHENTICATION CHECK AND I SHOULD USE THAT
  // FOR VALIDATING THE ACCOUNT.
  /////////////////////////////////////////////////////////////////////////////

  let accountId = req.params.accountId    // Get account id from url

  if(!ObjectID.isValid(accountId)) {
    logger.error('Invalid account id=[%s]', accountId)
    return res.status(404).send({
      code:     404,
      message:  'Account not found',
    })
  }

  try {
    let user    = await currentUser()

    let userId  = req.body.userId
    let account = await Account.findOne({
      _id:      accountId,
      //* userId:   userId,
      userId:   user._id,
    })

    if(account == null) {
      logger.error('User id=[%s] trying access account id=[%s]', user._id, accountId)
      return res.status(404).send({
        code:     404,
        message:  'Account not found'
      })
    }

    /**
     * IIEF to set the charge type and amount for a transaction. If the transaction is a
     * debit then the amount is negative and if the transaction is a credit then
     * the amount is positive. If the user submits and invalid charge then it defaults to
     * credit and if the user submits an invalid amount then it defaults to 0.
     * 
     * @param  charge - Either 'debit' or 'credit'
     * @param  amount - Transaction total
     * @return Returns an object with the charge and amount.
     */
    let {charge, amount} = (function calculateAmount(charge = 'debit', amount = 0) { 
      if(charge !== 'debit' && charge !== 'credit') { charge = 'debit' }
      if(isNaN(amount)) { amount = 0}

      let payment = {}
      if(amount === 0) {
        payment.charge = charge
        payment.amount = 0
      }
      else if(charge === 'debit') {
        payment.charge = 'debit'
        payment.amount = -1 * Math.abs(amount)
      }
      else {
        payment.charge = 'credit'
        payment.amount = Math.abs(amount)
      }
      return payment
    })(req.body.charge, req.body.amount)

    let transaction = new Transaction({
      description:  req.body.description,
      charge:       charge,
      amount:       amount,
      date:         req.body.date     ? new Date(req.body.date) : new Date(),
      category:     req.body.category || '', 
      userId:       user._id,                 
      accountId:    accountId      
    })
    logger.debug('Built transaction= %o', transaction)

    let result = await transaction.save()

    logger.info('Successfully created transaction= %o', result)
    res.status(201).send(result)
  }
  catch(err) {
    logger.error('Failed to create transaction, err= %o', err)
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
      logger.error(`[error] Failed to create transaction, err= `, err)
      errorResponse = {errors: err}
    }
    res.status(400).send(errorResponse)
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
