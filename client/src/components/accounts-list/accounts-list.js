//-----------------------------------------------------------------------------
// client/src/components/accounts-list/accounts-list.js
//-----------------------------------------------------------------------------
import React          from 'react'
import {
  ListGroup,
}                     from 'react-bootstrap'

import AccountSummary from '../account-summary/account-summary'

/**
 * Returns an array account-summary components.
 * @param {*} props 
 */
const AccountsList = (props) => {
  let accounts = props.accounts
  /**
   * Build array of account summary components to display.
   */ 
  const displayAccounts = (props) => {
    if(accounts.length === 0) { return null }

    const accountsList = accounts.map( (account) => {
      return (
        <ListGroup.Item key={account._id}>
          <AccountSummary 
            name                = {account.name}
            financialInstitute  = {account.financialInstitute}
            balance             = {account.balance}
          />
        </ListGroup.Item>
      )
    })
    return accountsList
  }

  // Render the accounts list
  return (
    <ListGroup variant='flush' style={{width:'100%'}}>
      {displayAccounts()}
    </ListGroup>
  )
}

// Export the accounts list
export default AccountsList