//-----------------------------------------------------------------------------
// client/src/api/transactions-api.js
//-----------------------------------------------------------------------------
import axios  from 'axios'

/**
 * API for managing a user's account transactions.
 */
const TransactionsAPI = {
  /**
   * Create a new transaction for an account. Calls the POST /api/v1/account/:accountId/transactions
   * API endpoint to create the transaction.
   * 
   * @param  {String}  accountId - Unique account identifier
   * @param  {Object}  params    - Transaction params(date, description, category, charge, amount)
   * @return {Promise} Transaction if POST was successful, ortherwise return an error.
   */
  create(accountId, params) {
    return new Promise( async (resolve, reject) => {
      if(!accountId) reject({ accountId: {code: 400, message: 'Account Id is required'} })

      const url = `http://localhost:5000/api/v1/accounts/${accountId}/transactions`
      try {
        let result      = await axios.post(url, params)
        let transaction = setCreditAndDebitFields(result.data)
        //* console.log(`[debug] Created transaction for account=[${accountId}], `, transaction)

        resolve({transaction})
      }
      catch(error) {
        if (error.response) {
          console.log(
            `[error] Failed to create account, `  + 
            `status=[${error.response.status}], ` +
            `data= [${error.response.data}]`
          )
          // Convert errors from [] to an {}
          let errors = {}
          error.response.data.errors.forEach( (err) => {
            errors[err.path] = {
              code:     err.code, 
              field:    err.path, 
              message:  err.message}
          })
    
          reject(errors)
        } 
        else if (error.request) {
          // The request was made but no response was received
          reject({
            server: {
              code:     500,
              message:  'Unable to connect to the server',
            }
          })
        } 
        else {
          // Received unknown server error.
          console.log('Error', error.message);
          reject({
            server: {
              code:     500,
              message:  'Unable to connect to the server',
            }
          })
        }
      }
    })
  },
  /**
   * Fetch and return all of the transactions for the specified account.
   * @param  {string}  accountId - Account ID
   * @return {promise} Returns array of transactions
   */
  findByAccountId(accountId) {
    return new Promise( async (resolve, reject) => {
      if(!accountId) reject({ accountId: {code: 400, message: 'Account Id is required'} })

      const url = `http://localhost:5000/api/v1/accounts/${accountId}/transactions`
      try {
        let result        = await axios.get(url)
        let transactions  = result.data.transactions.map( (txn) => setCreditAndDebitFields(txn) )

        //* console.log(`[debug] Account Id=[${accountId}], transactions = `, transactions)
        resolve(transactions);
      }
      catch(error) {
        //* console.log(`[error] Failed to fetch transactions for account id=[${accountId}], error= `, error)
        reject({
          server: {
            code:     500,
            message:  `Unable to get transactions for account id=[${accountId}]`,
          }
        })
      }
    })
  }
}

// Export the Transactions api
export default TransactionsAPI

/**
 * Add a debit and credit field to transactions return by the server. The
 * transactions need a debit and credit field for the transaction data grid.
 * 
 * Map the transaction amount field to either the debit or credit field based
 * on the type of charge. I need to do this in the response, since I am storing the
 * amount in one field in the DB w/ the charge type of debit or credit.
 * 
 * NOTE: I SHOULD INVESTIGATE MOVING THIS LOGIC TO THE SERVER.
 * 
 * @param {Array} transactions 
 */
function setCreditAndDebitFields(transaction) {
  if(transaction.charge === 'credit') {
    transaction.credit = transaction.amount
    transaction.debit  = ''
  }
  else {
    transaction.debit  = transaction.amount
    transaction.credit = ''
  }
  return transaction
}
