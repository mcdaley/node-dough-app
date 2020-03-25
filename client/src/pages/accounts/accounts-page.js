//-----------------------------------------------------------------------------
// client/src/pages/accounts/accounts-page.js
//-----------------------------------------------------------------------------
import React, { useState, useEffect }   from 'react'
import axios                            from 'axios'
import Container                        from 'react-bootstrap/Container'
import Row                              from 'react-bootstrap/Row'

import AccountSummary   from '../../components/account-summary/account-summary'

/**
 * List all of a user's accounts added to the dough app.
 */
function AccountsPage() {

  const [accounts, setAccounts] = useState([])
  useEffect( () => {
    const fetchData = async () => {
      try {
        const result = await axios.get('http://localhost:5000/api/v1/accounts');
        
        console.log(`[debug] fetchData, results = `, result.data)
        setAccounts(result.data.accounts);
      } 
      catch (err) {
        console.log(`[error] Failed to retrieve user accounts, error= `, err)
      }
    }
    fetchData()
  }, [accounts.length])


 /**
  * Build array of account summary components to display.
  */ 
 function displayAccounts() {
    if(accounts.length === 0) { return null }

    const accountsList = accounts.map( (account) => {
      return (
        <AccountSummary 
          name                = {account.name}
          financialInstitute  = {account.financialInstitute}
          balance             = {account.balance}
        />
      )
    })
    return accountsList
  }

  /**
   * Render the Accounts page
   */
  return (
    <Container>
      <Row>
        <h1>Dough Money - Accounts Page</h1>
      </Row>
      <Row>
        {displayAccounts()}
      </Row>
    </Container>
  )
}

// Export the AccountsPage
export default AccountsPage