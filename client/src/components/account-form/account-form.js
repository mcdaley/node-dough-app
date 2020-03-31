//-----------------------------------------------------------------------------
// client/src/components/account-form/account-form.js
//-----------------------------------------------------------------------------
import React                from 'react'
import { Formik }           from 'formik'
import * as Yup             from 'yup'
import {
  Form, 
  Col,
  Button,
}                           from 'react-bootstrap'
import DatePicker           from 'react-datepicker'

import "react-datepicker/dist/react-datepicker.css";

const accountValidationSchema = Yup.object({
  nickname:   Yup.string()
    .max(128, 'Nickname muust be 128 characters or less')
    .required('Nickname is Required'),
  financialInstitute: Yup.string()
    .max(128, 'Financial Institute muust be 128 characters or less')
    .required('Financial Institute is Required'),
  accountType:  Yup.array()
    .of(Yup.string().oneOf(['Checking', 'Savings', 'Credit Card'])),
  balance:    Yup.number()
    .typeError('Balance must be a number'),
  startDate:  Yup.date()
    .typeError('Invalid date')
    .default(function() {
      return new Date();
    })
})

/**
 * Form for adding a new account to a user's portfolio.
 * @param {*} props 
 */
function AccountForm(props) {
  
  return (
    <Formik
      initialValues = {{
        nickname:           '',
        financialInstitute: '',
        accountType:        'Checking',
        balance:            '',
        startDate:          '',
      }}
      validationSchema = {accountValidationSchema}
      onSubmit = { (values) => console.log(`[debug] Submitted the form, values= `, values)}
    >
      {
        ({ handleSubmit,
           handleChange,
           handleBlur,
           setFieldValue,
           values,
           touched,
           errors }) => (
          <Form noValidate onSubmit={handleSubmit}  >

            {/* Account Nickname */}
            <Form.Group controlId='nickname'>
              <Form.Label>Account Nickname</Form.Label>
              <Form.Control
                type        = 'text' 
                autoFocus   = {true}
                placeholder = 'Enter account nickname'
                name        = 'nickname'
                onChange    = {handleChange}
                onBlur      = {handleBlur}
                value       = {values.nickname}
                isInvalid   = {touched.nickname && !!errors.nickname}
              />
              <Form.Control.Feedback type='invalid'>
                {errors.nickname ? errors.nickname : null}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Financial Institute */}
            <Form.Group controlId='financialInstitute'>
              <Form.Label>Financial Institute</Form.Label>
              <Form.Control 
                type        = 'text'
                placeholder = 'Enter financial institute'
                name        = 'financialInstitute'
                value       = {values.financialInstitute}
                onChange    = {handleChange}
                isInvalid   = {touched.financialInstitute && !!errors.financialInstitute}
              />
              <Form.Control.Feedback type='invalid'>
                {errors.financialInstitute ? errors.financialInstitute : null}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Account Type */}
            <Form.Group controlId="accountType">
              <Form.Label>Account Type</Form.Label>
              <Form.Control 
                as        = 'select' 
                name      = 'accountType'
                value     = {values.accountType} 
                onChange  = {handleChange}>
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
                    placeholder = 'Enter account balance'
                    name        = 'balance'
                    value       = {values.balance}
                    onChange    = {handleChange}
                    isInvalid   = {!!errors.balance}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.balance ? errors.balance : null}
                  </Form.Control.Feedback>
                </Col>
                <Col>
                  <Form.Label>As of Date</Form.Label>
                  <div>
                    <DatePicker
                      id        = 'asOfDate'
                      className = 'form-control'
                      selected  = {values.startDate}
                      onChange  = {(e) => setFieldValue('startDate', e)}
                    />
                  </div>
                </Col>
              </Form.Row>
            </Form.Group>

            {/* Submit and Cancel Buttons */}
            <Form.Group>
              <Button 
                variant='primary' 
                type='submit' 
                style={{marginRight:'1.0rem'}}
              >
                Save
              </Button>
              <Button variant='secondary' onClick={ () => console.log(`[debug] Clear form`)}>
                Cancel
              </Button>
            </Form.Group>
          </Form>
        )
      }
    </Formik>
  )
}

// Export the AccountForm
export default AccountForm