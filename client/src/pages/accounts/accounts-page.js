//-----------------------------------------------------------------------------
// client/src/pages/accounts/accounts-page.js
//-----------------------------------------------------------------------------
import React            from 'react'
import Container        from 'react-bootstrap/Container'
import Row              from 'react-bootstrap/Row'

import AccountSummary   from '../../components/account-summary/account-summary'

/**
 * List all of a user's accounts added to the dough app.
 */
const AccountsPage = () => {
  return (
    <Container>
      <Row>
        <h1>Dough Money - Accounts Page</h1>
      </Row>
      <Row>
        <AccountSummary
          name                = 'BofA Checking Account'
          financialInstitute  = 'Bank of America'
          balance             = {202.25}
        />
      </Row>
    </Container>
  )
}

// Export the AccountsPage
export default AccountsPage