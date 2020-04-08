//-----------------------------------------------------------------------------
// client/src/pages/accounts/Show.js
//-----------------------------------------------------------------------------
import React, { useState, useEffect }   from 'react'
import { 
  Container, 
  Row,
  Col,
  Table,
  Button, 
}                                       from 'react-bootstrap'
import { useParams, useHistory }        from 'react-router-dom'

import AccountsAPI                      from '../../api/accounts-api'
import TransactionsAPI                  from '../../api/transactions-api'
import AccountSummary                   from '../../components/account/Summary'

/**
 * 
 */
const PagesAccountsShow = () => {
  let history = useHistory()        // Link to navigate to previous screen

  // Get accountId, so it can be as the useEffect() dependency
  let   { id }                    = useParams()   // Get accountId from the URL
  const [accountId, setAccountId] = useState(id)

  // Get the user account
  const [account, setAccount] = useState({})
  useEffect( () => {
    const fetchData = async () => {
      try {
        let result = await AccountsAPI.find(accountId)
        
        console.log(`[debug] AccountsAPI.get(), account = `, result)
        setAccount(result);
      } 
      catch (error) {
        console.log(`[error] Failed to retrieve user accounts, error= `, error)
        setErrors(error)
      }
    }
    fetchData()
  }, [accountId])

  // Get the account's transactions
  const [transactions, setTransactions] = useState([])
  useEffect( () => {
    const fetchData = async () => {
      try {
        let result = await TransactionsAPI.findByAccountId(accountId)

        console.log(`[debug] TransactionsAPI.findByAccountId(${accountId})= `, result)
        setTransactions(result)
      }
      catch(error) {
        console.log(`[error] Failed to retrieve account transactions, error= `, error)
        setErrors(error)
      }
    }

    fetchData()
  }, [accountId])

  // Handle create account errors
  const [errors, setErrors] = useState({})

  /**
   * Navigate back to the previous screen.
   */
  const handleClick = () => history.goBack()

  /**
   * Render the account summary.
   */
  const renderAccountSummary = () => {
    return account == null
    ? null
    : (
      <AccountSummary
        _id                 = {account._id}
        name                = {account.name}
        financialInstitute  = {account.financialInstitute}
        balance             = {account.balance}
      />
    )
  }

  /**
   * Render the account transactions.
   */
  const renderTransactions = () => {
    if(transactions == null) return null

    function rows() {
      return transactions.map( (txn) => {
        return (
          <tr>
            <td>{txn.date}</td>
            <td>{txn.description}</td>
            <td>{txn.category}</td>
            <td>{txn.charge}</td>
            <td>{txn.amount}</td>
          </tr>
        )
      })
    }

    return (
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Charge</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows()}
        </tbody>
      </Table>
    )
  }

  /**
   * Render the PagesAccountsShow screen
   */
  return (
    <Container fluid>      
      <Row>
        <Col>
          {renderAccountSummary()}
        </Col>
      </Row>
      <Row>
        <Col>
          {renderTransactions()}
        </Col>
      </Row>
      <Button variant='primary' onClick={handleClick}>
        Go Back
      </Button>
    </Container>
  )
}

// Export the account details page
export default PagesAccountsShow