//-----------------------------------------------------------------------------
// client/src/components/transaction/Form.js
//-----------------------------------------------------------------------------
import React, { useState }  from 'react'
import {
  Row,
  Col,
  Form,
  Button,
}                           from 'react-bootstrap'

import TransactionsAPI      from '../../api/transactions-api'

/**
 * 
 * @param {*} props 
 */
const TransactionForm = (props) => {
  const { accountId }                 = props

  const [date, setDate]               = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory]       = useState('')
  const [debit, setDebit]             = useState('')
  const [credit, setCredit]           = useState('')

  const onChangeDate        = (event) => setDate(event.target.value)
  const onChangeDescription = (event) => setDescription(event.target.value)
  const onChangeCategory    = (event) => setCategory(event.target.value)
  
  const onChangeDebit = (event) => {
    setDebit(event.target.value)
    setCredit('')
  }
  
  const onChangeCredit = (event) => {
    setCredit(event.target.value)
    setDebit('')
  }

  /**
   * Determine if the transaction is a debit or credit.
   */
  const getCharge = () => {
    if(debit === '' && credit === '') return 'debit'
    if(debit !== '')                  return 'debit'

    return 'credit'
  }

  /**
   * Calculate the amount of the transaction. If the amount is a debit then
   * ensure itis a negative number, if the amount is a credit then ensure 
   * it is a positive number. If an amount was not specified set the default
   * amount to 0.
   */
  const getAmount = () => {
    const charge    = getCharge()
    const amountStr = charge === 'debit' ? debit : credit
    if(amountStr === '') {
      return 0
    }
    else if(charge === 'debit') {
      return -1 * Math.abs(parseFloat(amountStr))
    }
    else {
      return Math.abs(parseFloat(amountStr))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    let transaction = {
      date:         new Date().toISOString(),
      description:  description,
      category:     category,
      charge:       getCharge(),
      amount:       getAmount(),
    }

    try {
      let result = await TransactionsAPI.create(accountId, transaction)
      console.log(`[info] Created transaction: ${JSON.stringify(result, undefined, 2)}`)

      props.onSubmit(result)
    }
    catch(error) {
      console.log(`[error] Failed to create transaction, error= `, error)
    }
  }

  const clearForm = (event) => {
    setDate('')
    setDescription('')
    setCategory('')
    setDebit('')
    setCredit('')
  }

  return (
    <Form onSubmit={handleSubmit} style={{marginBottom: '1.0rem'}}>
      <Form.Row>
        <Col>
          <Form.Control 
            value       = {date} 
            placeholder = 'mm/dd/yyyy' 
            onChange    = {onChangeDate} 
          />
        </Col>
        <Col>
          <Form.Control 
            value       = {description}
            placeholder = 'Description' 
            onChange    = {onChangeDescription}
          />
        </Col>
        <Col>
          <Form.Control 
            value       = {category}
            placeholder = 'Category' 
            onChange    = {onChangeCategory} 
          />
        </Col>
        <Col>
          <Form.Control
            value       = {debit}
            placeholder = 'Debit'
            onChange    = {onChangeDebit} 
          />
        </Col>
        <Col>
          <Form.Control
            value       = {credit}
            placeholder = 'Credit' 
            onChange    = {onChangeCredit} 
          />
        </Col>
        <Col>
          <Button 
            variant = 'primary' 
            type    = 'submit'
          >
              Save
          </Button>
        </Col>
        <Col>
          <Button 
            variant = 'secondary' 
            onClick = {clearForm}
          >
              Clear
          </Button>
        </Col>
      </Form.Row>
    </Form>
  )

}

// Export the TransactionForm
export default TransactionForm