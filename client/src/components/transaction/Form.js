//-----------------------------------------------------------------------------
// client/src/components/transaction/Form.js
//-----------------------------------------------------------------------------
import React, { useState }  from 'react'
import {
  Button,
  Col,
  Form,
  Row,
  Table,
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
      <Table size='sm' variant='dark'>
        <tbody>
          <tr>
            <td style={{width: '15%'}}>
              <Form.Control 
                value       = {date} 
                placeholder = 'mm/dd/yyyy' 
                onChange    = {onChangeDate} 
              />
            </td>
            <td style={{width: '25%'}}>
              <Form.Control 
                value       = {description}
                placeholder = 'Description' 
                onChange    = {onChangeDescription}
              />
            </td>
            <td style={{width: '15%'}}> 
              <Form.Control 
                value       = {category}
                placeholder = 'Category' 
                onChange    = {onChangeCategory} 
              />
            </td>
            <td style={{width: '15%'}}> 
              <Form.Control
                value       = {debit}
                placeholder = 'Debit'
                onChange    = {onChangeDebit} 
              />
            </td>
            <td style={{width: '15%'}}>
              <Form.Control
                value       = {credit}
                placeholder = 'Credit' 
                onChange    = {onChangeCredit} 
              />
            </td>
            <td style={{width: '15%'}}>
              <Button 
                variant = 'primary' 
                type    = 'submit'
                size    = 'md'
                style   = {{marginLeft: '0.50rem', marginRight: '0.50rem'}}
              >
                  Save
              </Button>
              <Button 
                variant = 'secondary'
                size    = 'md'
                onClick = {clearForm}
              >
                  Clear
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </Form>
  )

}

// Export the TransactionForm
export default TransactionForm