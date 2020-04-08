//-----------------------------------------------------------------------------
// client/src/api/transactions-api.js
//-----------------------------------------------------------------------------
import axios  from 'axios'

/**
 * API for managing a user's account transactions.
 */
const TransactionsAPI = {
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
        let result = await axios.get(url)

        console.log(`[debug] Account Id=[${accountId}], transactions = `, result.data)
        resolve(result.data.transactions);
      }
      catch(error) {
        console.log(`[error] Failed to fetch transactions for account id=[${accountId}], error= `, error)
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