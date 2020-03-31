//-----------------------------------------------------------------------------
// client/src/pages/accounts/accounts-page.js
//-----------------------------------------------------------------------------
import React, { useState, useEffect }   from 'react'
import axios                            from 'axios'
import {
  Container,
  Row,
  Col,
  Button,
  ListGroup,
}                                       from 'react-bootstrap'

import AccountSummary     from '../../components/account-summary/account-summary'
import CreateAccountModal from '../../components/account-form/account-form-modal'
//* import AccountForm        from '../../components/account-form/account-form'

/**
 * List all of a user's accounts added to the dough app.
 */
function AccountsPage() {

  // Fetch user accounts when page loads
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

  // Toggle the visibility of the create account modal.
  const [show, setShow] = useState(false)
  const showAddAccountModal = () => setShow(true)
  const hideAddAccountModal = () => setShow(false)

  /**
   * Build array of account summary components to display.
   */ 
  function displayAccounts() {
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

  /**
   * Callback to create the account once the user has entered form fields.
   * @param {*} values 
   * @param {*} resetForm 
   * @param {*} setSubmitting 
   */
  const handleSubmit = (values, resetForm, setSubmitting) => {
    setTimeout(() => {
      alert(
        'In the onSubmit callback, values= ' +
        JSON.stringify(values, undefined, 2)
      )
      resetForm();
      setSubmitting(false);
      hideAddAccountModal()
    }, 250)

    return
  }

  /**
   * Render the Accounts page
   */
  return (
    <Container>
      <Row>
        <CreateAccountModal
          title     = 'Dude, Add a New Account'
          show      = {show} 
          onSubmit  = {handleSubmit}
          onClose   = {hideAddAccountModal} 
        />
      </Row>
      <Row>
        <h1>Dough Money - Accounts Page</h1>
      </Row>
      <Row>
        <ListGroup variant='flush' style={{width:'100%'}}>
          {displayAccounts()}
        </ListGroup>
      </Row>
      <Row>
        <Button variant='primary' onClick={showAddAccountModal}>
          Add Account
        </Button>
      </Row>
    </Container>
  )
}

// Export the AccountsPage
export default AccountsPage