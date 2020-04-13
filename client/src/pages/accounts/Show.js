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
import TransactionGrid                  from '../../components/transaction/Grid'
import TransactionForm                  from '../../components/transaction/Form'
import { runningBalance }               from '../../utils/transactions-helper'

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
   * Callback to handle the creation of a new transaction. It updates
   * the transactions array w/ the new transaction to re-render the
   * transaction data grid.
   * 
   * @param {Object} transaction - Transaction that was just created in DB
   */
  const onCreateTransaction = ({transaction}) => {
    console.debug(`[debug] Created transaction= `, transaction)

    let transactionList = buildTransactionList(transaction)
    setTransactions(transactionList)
  }

  /**
   * Sort the transactions and calculate the running balance for the account.
   * @param {*} transaction - Transaction that was just created.
   */
  const buildTransactionList = (transaction) => {
    let txnList = [...transactions, transaction].sort( (a,b) => {
      return new Date(b.date) - new Date(a.date)
    })
    txnList = runningBalance(txnList)

    return txnList
  }

  /**
   * Render the account summary.
   */
  const renderAccountSummary = () => {
    if(Object.keys(account).length === 0 || account == null) return null
    
    return (
      <AccountSummary
        _id                 = {account._id}
        name                = {account.name}
        financialInstitute  = {account.financialInstitute}
        balance             = {account.balance}
      />
    )
  }

  /**
   * Render the form to create new account transactions.
   */
  const renderTransactionForm = () => {
    if(Object.keys(account).length === 0 || account == null) return null

    return (
      <TransactionForm
        accountId = {account._id}
        onSubmit  = {onCreateTransaction}
      />
    )
  }

  /**
   * Render the transactions grid
   */
  const renderTransactions = () => {
    if(transactions.length === 0) return null

    return (
      <TransactionGrid transactions={transactions} />
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
          {renderTransactionForm()}
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