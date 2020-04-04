//-----------------------------------------------------------------------------
// client/src/api/accounts.js
//-----------------------------------------------------------------------------
import axios from 'axios'

/**
 * API for managing user accounts.
 */
const AccountsAPI = {
  /**
   * Return all of the users accounts.
   */
  get() {
    return new Promise( async (resolve, reject) => {
      try {
        const result = await axios.get('http://localhost:5000/api/v1/accounts');
        
        //* console.log(`[debug] fetchData, results = `, result.data)
        resolve(result.data.accounts);
      } 
      catch (err) {
        //* console.log(`[error] Failed to retrieve user accounts, error= `, err)
        reject({
          server: {
            code:     500,
            message:  'Unable to get your accounts',
          }
        })
      }
    })
  },
  /**
   * Create a new account for the user in the DB.
   * @param {*} account 
   */
  create(params) {
    return new Promise( async (resolve, reject) => {
      const url = 'http://localhost:5000/api/v1/accounts'

      try {
        let response = await axios.post(url, params)

        //* console.log(`[info] Created account= `, response.data)
        resolve(response.data)
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
  }
}

// Export accounts api
export default AccountsAPI