//-----------------------------------------------------------------------------
// server/routes/transactions.js
//-----------------------------------------------------------------------------
const express       = require('express')
const { ObjectID }  = require('mongodb')

const Transaction   = require('../models/transaction')
const User          = require('../models/user')
const Account       = require('../models/account')
const logger        = require('../config/winston')

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
        logger.error(
          `Failed to get user w/ email=[fergie@bills.com], err= %o`, err
        )
        reject(err)  
      })
  })
}

const router  = express.Router()

/*
 * GET /api/v1/accounts/:accountId/transactions
 */
router.get('/v1/accounts/:accountId/transactions', async (req, res) => {
  logger.info('GET /api/v1/accounts/:id/transactions/:id, params= %o', req.params)
  
  let accountId = req.params.accountId
  
  if(!ObjectID.isValid(accountId)) {
    logger.error('Invalid account id=[%s]', accountId)
    return res.status(404).send({
      code:     404,
      message:  'Account not found',
    })
  }

  try {
    let user          = await authenticateUser()
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
  logger.info('POST /api/v1/transactions, params= %o, body= %o', req.params, req.body)

  try {
    let user    = await authenticateUser()

    let transaction = new Transaction({
      description:  req.body.description,
      amount:       req.body.amount || 0,
      date:         req.body.date || new Date(),
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

// Export the transactions router
module.exports = router
