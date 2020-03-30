//-----------------------------------------------------------------------------
// client/src/components/account-form/account-form.js
//-----------------------------------------------------------------------------
import React, { useState }  from 'react'
import axios                from 'axios' 
import {
  Form, 
  Col,
  Button,
}                           from 'react-bootstrap'
import DatePicker           from 'react-datepicker'

import "react-datepicker/dist/react-datepicker.css";

/**
 * Form for adding a new account to a user's portfolio.
 * @param {*} props 
 */
function AccountForm(props) {
  // Form fields
  const [nickname, setNickname]                     = useState('')
  const [financialInstitute, setFinancialInstitute] = useState('')
  const [accountType, setAccountType]               = useState('Checking')
  const [balance, setBalance]                       = useState('')
  const [startDate, setStartDate]                   = useState(null)
  const [errors, setErrors]                         = useState({})

  const handleNickname            = (evt) => setNickname(evt.target.value)
  const handleFinancialInstitute  = (evt) => setFinancialInstitute(evt.target.value)
  const handleAccountType         = (evt) => setAccountType(evt.target.value)
  const handleBalance             = (evt) => setBalance(evt.target.value)

  const handleStartDate = (date) => {
    setStartDate(date)
  };

  /////////////////////////////////////////////////////////////////////////////
  // TODO: 03/27/2020
  // IMPLEMENT THE ADD ACCOUNT FORM W/ FOLLOWING STEPS:
  //  [x] - CALL POST /API/V1/ACCOUNTS TO CREATE A NEW ACCOUNT AND JUST LOG IT
  //  [x] - WORK THROUGH ALL OF THE API VALIDATION CASES:
  //    [x] * NICKNAME IS REQUIRED
  //    [x] * FINANCIAL INSTITUTE IS REQUIRED
  //    [x] * INVALID ACCOUNT TYPE
  //    [x] * INVALID BALANCE, E.G., NOT A NUMBER
  //    [x] * INVALID DATE
  //  - INVALID CASES SHOULD RETURN AN ERROR THAT I CAN USE TO UPDATE THE
  //    ACCOUNT FORM.
  //    * ADD ERROR TO THE STATE
  //    * IF API RETURNS ERROR, PRINT MESSAGE UNDER EACH FORM
  //    * ADD RED BORDER TO EACH INPUT ERROR
  //    * DO NOT CLEAR THE INPUTS
  //  - CLEAR INPUT FIELDS IF ACCOUNT IS CREATED.
  /////////////////////////////////////////////////////////////////////////////
  /**
   * Save the account by calling POST /api/v1/accounts.
   * @param {*} event
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    // Convert balance to a number or return a string
    function validateBalance(balance) {
      let result = parseFloat(balance)

      if(isNaN(balance)) { 
        return balance      // TODO: Could also return 0 here!
      }
      return result
    }
    
    let params = {
      name:               nickname,
      financialInstitute: financialInstitute,
      type:               accountType,
      balance:            validateBalance(balance),
      initialDate:        startDate ? startDate.toISOString() : new Date().toISOString(),
    }
    console.log(`[debug] Submit add account,  params= `, params)
    let result = createAccount(params)

    console.log(`[debug] result= `, result)
    clearState()
    return
  }

  /**
   * Call the dough app api to create the account
   * @param {*} params 
   */
  const createAccount = async (params) => {
    const url = 'http://localhost:5000/api/v1/accounts'
    try {
      let response = await axios.post(url, params)

      console.log(`[info] Created account= `, response.data)
      return response.data
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
          code:     500,
          message:  'Unable to connect server',
        })
      } 
      else {
        // Received unknown server error.
        console.log('Error', error.message);
        setErrors({
          code:     500,
          message:  error.message,
        })
      }
    }
  }

  /**
   * Clear the form inputs and close the form.
   * @param {*} evt 
   */
  const handleCancel = (evt) => clearState()

  /**
   * Clear the state and the form.
   */
  const clearState = () => {
    setNickname('')
    setFinancialInstitute('')
    setAccountType('Checking')
    setBalance('')
  }

  return (
    <Form noValidate onSubmit={handleSubmit} >

      {/* Account Nickname */}
      <Form.Group controlId='name'>
        <Form.Label>Account Nickname</Form.Label>
        <Form.Control
          type        = 'text' 
          autoFocus   = {true}
          value       = {nickname}
          placeholder = 'Enter account nickname'
          onChange    = {handleNickname}
          isInvalid   = {!!errors.name}
        />
        <Form.Control.Feedback type='invalid'>
          {errors.name ? errors.name.message : null}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Financial Institute */}
      <Form.Group controlId='financialInstitute'>
        <Form.Label>Financial Institute</Form.Label>
        <Form.Control 
          type        = 'text'
          value       = {financialInstitute}
          placeholder = 'Enter financial institute'
          onChange    = {handleFinancialInstitute}
          isInvalid   = {!!errors.financialInstitute}
        />
        <Form.Control.Feedback type='invalid'>
          {errors.financialInstitute ? errors.financialInstitute.message : null}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Account Type */}
      <Form.Group controlId="accountType">
        <Form.Label>Account Type</Form.Label>
        <Form.Control as="select" value={accountType} onChange={handleAccountType}>
          <option value='Checking'>Checking</option>
          <option value='Savings'>Savings</option>
          <option value='Credit Card'>Credit Card</option>
        </Form.Control>
      </Form.Group>
      
      {/* Account Balance and AsOfDate */}
      <Form.Group>
        <Form.Row>
          <Col>
            <Form.Label>Account Balance</Form.Label>
            <Form.Control 
              required
              id          = 'balance'
              type        = 'text' 
              value       = {balance}
              placeholder = 'Enter account balance'
              onChange    = {handleBalance}
              isInvalid   = {!!errors.balance}
            />
            <Form.Control.Feedback type="invalid">
              {errors.balance ? errors.balance.message : null}
            </Form.Control.Feedback>
          </Col>
          <Col>
            <Form.Label>As of Date</Form.Label>
            <div>
              <DatePicker
                className = 'form-control'
                selected  = {startDate}
                onChange  = {handleStartDate}
                id        = 'asOfDate'
              />
            </div>
          </Col>
        </Form.Row>
      </Form.Group>

      {/* Submit and Cancel Buttons */}
      <Form.Group>
        <Button variant='primary' type='submit' style={{marginRight:'1.0rem'}}>
          Save
        </Button>
        <Button variant='secondary' onClick={handleCancel}>
          Cancel
        </Button>
      </Form.Group>
    </Form>
  )
}

// Export the AccountForm
export default AccountForm