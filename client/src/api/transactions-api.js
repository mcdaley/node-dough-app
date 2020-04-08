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
        let result        = await axios.get(url)
        let transactions  = this.mapTransactions(result.data.transactions)

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
  },
  /**
   * Map the transaction amount field to either the debit or credit field based
   * on the type of charge. I need to do this in the response, since I am storing the
   * amount in one field in the DB w/ the charge type of debit or credit.
   * 
   * NOTE: I SHOULD INVESTIGATE MOVING THIS LOGIC TO THE SERVER.
   * 
   * @param {Array} transactions 
   */
  mapTransactions(transactions) {
    return transactions.map( (txn) => {
      if(txn.charge === 'credit') {
        txn.credit = txn.amount
        txn.debit  = ''
      }
      else {
        txn.debit  = txn.amount
        txn.credit = ''
      }
      return txn
    })
  }
}

// Export the Transactions api
export default TransactionsAPI