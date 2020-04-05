//-----------------------------------------------------------------------------
// client/src/pages/accounts/accounts-page.js
//-----------------------------------------------------------------------------
import React, { useState, useEffect }   from 'react'
import {
  Container,
  Row,
  Button,
  Alert,
}                                       from 'react-bootstrap'

import AccountsList       from '../../components/accounts-list/accounts-list'
import CreateAccountModal from '../../components/account-form/account-form-modal'
import AccountsAPI        from '../../api/accounts-api'

/**
 * List all of a user's accounts added to the dough app.
 */
function AccountsPage() {

  // Fetch user accounts when page loads
  const [accounts, setAccounts] = useState([])
  useEffect( () => {
    const fetchData = async () => {
      try {
        let accounts = await AccountsAPI.get()
        
        //* console.log(`[debug] AccountsAPI.get(), accounts = `, accounts)
        setAccounts(accounts);
      } 
      catch (error) {
        console.log(`[error] Failed to retrieve user accounts, error= `, error)
        setErrors(error)
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
  const handleSubmit = async (values, resetForm, setSubmitting) => {
    //* console.log(`[info] Create account w/ input form fields= `, values)

    // Create the account and update the state
    try {
      let account = await AccountsAPI.create({
        name:               values.nickname,
        financialInstitute: values.financialInstitute,
        type:               values.accountType,
        balance:            values.balance,
        asOfDate:           values.asOfDate,
      })

      setAccounts([...accounts, account])
    }
    catch(error) {
      console.log(`[error] Failed to create account, error= `, error)
      setErrors(error)
    }
    finally {
      // Cleanup and close the modal.
      resetForm()
      setSubmitting(false)
      hideAddAccountModal()
    }
  }

  /**
   * Display a message if there was an error fetching the user's accounts
   * or if there was an error creating a new account.
   */
  function displayError() {
    if(errors.server == null) { return null }

    return (
      <Alert variant='danger' style={{width:'100%'}}>
        {errors.server.message}
      </Alert>
    )
  }

  /**
   * Render the Accounts page
   */
  return (
    <Container>
      <Row>
        <CreateAccountModal
          title     = 'Add a New Account'
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
        <AccountsList accounts={accounts} />
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