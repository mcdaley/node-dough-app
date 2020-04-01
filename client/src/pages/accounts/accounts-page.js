//-----------------------------------------------------------------------------
// client/src/pages/accounts/accounts-page.js
//-----------------------------------------------------------------------------
import React, { useState, useEffect }   from 'react'
import axios                            from 'axios'
import {
  Container,
  Row,
  Button,
  ListGroup,
  Alert,
}                                       from 'react-bootstrap'

import AccountSummary     from '../../components/account-summary/account-summary'
import CreateAccountModal from '../../components/account-form/account-form-modal'

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
        setErrors({
          server: {
            code:     500,
            message:  'Unable to get your accounts',
          }
        })
      }
    }
    fetchData()
  }, [])

  // Toggle the visibility of the create account modal.
  const [show, setShow] = useState(false)
  const showAddAccountModal = () => setShow(true)
  const hideAddAccountModal = () => setShow(false)

  // Handle create account errors
  const [errors, setErrors] = useState({})

  /**
   * Callback to create the account once the user has entered form fields.
   * @param {Object}   values        - Fields from the create account form
   * @param {Function} resetForm     - callback to clear form fields
   * @param {Function} setSubmitting - callback to reset form
   */
  const handleSubmit = (values, resetForm, setSubmitting) => {
    console.log(`[info] Create account w/ values= `, values)
    
    // Create the account and update the state
    createAccount({
      name:               values.nickname,
      financialInstitute: values.financialInstitute,
      type:               values.accountType,
      balance:            values.balance,
      initialDate:        values.startDate,
    })

    // Close the modal
    resetForm();
    setSubmitting(false);
    hideAddAccountModal()
  }

  /**
   * Call the create accounts api. If the account was created then update
   * the accounts, otherwise update the errors.
   * 
   * @param {*} params 
   */
  const createAccount = async (params) => {
    const url = 'http://localhost:5000/api/v1/accounts'
    try {
      let response = await axios.post(url, params)

      console.log(`[info] Created account= `, response.data)
      setAccounts([...accounts, response.data])
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

        setErrors(errors)
      } 
      else if (error.request) {
        // The request was made but no response was received
        setErrors({
          server: {
            code:     500,
            message:  'Unable to connect server',
          }
        })
      } 
      else {
        // Received unknown server error.
        console.log('Error', error.message);
        setErrors({
          server: {
            code:     500,
            message:  'Unable to connect server',
          }
        })
      }
    }
    return
  }

  /**
   * Display a message if there was an error fetching the user's accounts
   * or if there was an error creating a new account.
   */
  function displayError() {
    if(errors.server == null) { return null }

    return (
      <Alert variant='danger'>
        {errors.server.message}
      </Alert>
    )
  }

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
        {displayError()}
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