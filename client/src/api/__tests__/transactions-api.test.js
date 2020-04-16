//-----------------------------------------------------------------------------
// client/src/api/__tests__/transactions-api.test.js
//-----------------------------------------------------------------------------
import axiosMock        from 'axios'
import TransactionsAPI  from '../transactions-api'

jest.mock('axios')      // https://jestjs.io/docs/en/mock-functions#mocking-modules

// Mock transaction data for an account
const transactionsData = [
  { 
    _id:          '1',
    date:         '2020-03-31T07:00:00.000Z',
    description:  'Transaction One', 
    category:     'Groceries', 
    amount:       -100.00,
    accountId:    '99',
    userId:       'Me'
  },
  { 
    _id:          '2',
    date:         '2020-04-01T07:00:00.000Z',
    description:  'Transaction Two', 
    category:     'Household', 
    amount:       -55.55,
    accountId:    '99',
    userId:       'Me'
  },
  { 
    _id:          '3',
    date:         '2020-04-01T07:00:00.000Z',
    description:  'Transaction Test Credit', 
    category:     'Salary', 
    amount:       300.00,
    accountId:    '99',
    userId:       'Me'
  }
]

describe('Transactions API', () => {
  afterEach( () => {
    axiosMock.get.mockClear()
    axiosMock.post.mockClear()
    axiosMock.put.mockClear()
  })
  
  /**
   * TransactionsAPI.findByAccountId()
   */
  describe('findByAccountId', () => {
    it('Returns an array of transactions', async () => {
      axiosMock.get.mockResolvedValueOnce({
        data: { transactions: transactionsData },
      })

      const transactions = await TransactionsAPI.findByAccountId(transactionsData[0].accountId)
      expect(transactions.length).toBe(3)
      
      expect(transactions[0].description).toBe(transactionsData[0].description)
      expect(transactions[0].debit).toBe(transactionsData[0].amount)
      expect(transactions[0].credit).toBe('')

      expect(transactions[2].description).toBe(transactionsData[2].description)
      expect(transactions[2].credit).toBe(transactionsData[2].amount)
      expect(transactions[2].debit).toBe('')
    })

    it('Returns a server error', async () => {
      const accountId   = transactionsData[0].accountId
      const serverError = {
        server: { 
          code:     500, 
          message:  `Unable to get your transactions for account id=[${accountId}]` 
        }
      }

      // Add mock implementation to simulate a server error
      axiosMock.get.mockImplementationOnce(() =>
        Promise.reject(serverError),
      )

      try {
        const transactions = await TransactionsAPI.findByAccountId(accountId)
      }
      catch(error) {
        expect(error.server.code).toBe(500)
        expect(error.server.message).toMatch(/Unable to get transactions/)
      }
    })
  })

  /**
   * TransactionsAPI.create()
   */
  describe('create', () => {
    it('Creates a debit transaction', async () => {
      const accountId = transactionsData[0].accountId
      const url       = `http://localhost:5000/api/v1/accounts/${accountId}/transactions`
      const params    = {
        date:         '2020-03-31T07:00:00.000Z',
        description:  'Transaction One', 
        category:     'Groceries', 
        amount:       -100.00
      }

      // Add mock implementation to simulate a server error
      axiosMock.post.mockImplementationOnce( (url, params) =>
        Promise.resolve({ data: {...params, _id: '99', accountId: accountId, userId: 'Me'} }),
      )

      let {transaction} = await TransactionsAPI.create(accountId, params)

      expect(transaction.date).toBe('2020-03-31T07:00:00.000Z')
      expect(transaction.description).toMatch(/transaction on/i)
      expect(transaction.category).toBe('Groceries')
      expect(transaction.amount).toBe(-100)
      expect(transaction.debit).toBe(-100)
      expect(transaction.credit).toBe('')
      expect(transaction._id).toBe('99')
      expect(transaction.accountId).toBe(accountId)
      expect(transaction.userId).toBe('Me')
    })

    it('Creates a credit transaction', async () => {
      const accountId = transactionsData[0].accountId
      const url       = `http://localhost:5000/api/v1/accounts/${accountId}/transactions`
      const params    = {
        date:         '2020-03-31T07:00:00.000Z',
        description:  'Transaction Two', 
        category:     'Salary', 
        amount:       400.00
      }

      // Add mock implementation to simulate a server error
      axiosMock.post.mockImplementationOnce( (url, params) =>
        Promise.resolve({ data: {...params, _id: '99', accountId: accountId, userId: 'Me'} }),
      )

      let {transaction} = await TransactionsAPI.create(accountId, params)

      expect(transaction.date).toBe('2020-03-31T07:00:00.000Z')
      expect(transaction.description).toMatch(/transaction two/i)
      expect(transaction.category).toBe(params.category)
      expect(transaction.amount).toBe(params.amount)
      expect(transaction.debit).toBe('')
      expect(transaction.credit).toBe(params.amount)
      expect(transaction._id).toBe('99')
      expect(transaction.accountId).toBe(accountId)
      expect(transaction.userId).toBe('Me')
    })

    it('Returns a server error', async () => {
      const url     = 'http://localhost:5000/api/v1/accounts/xxx/transactions'
      const params  = {}

      const serverError = {
        server: { code: 500, message: 'Unable to get your accounts' }
      }

      // Add mock implementation to simulate a server error
      axiosMock.post.mockImplementationOnce((url, params) =>
        Promise.reject(serverError),
      )

      try {
        const transaction = await TransactionsAPI.create(params)
      }
      catch(error) {
        expect(error.server.code).toBe(500)
        expect(error.server.message).toMatch(/Unable to connect to the server/)
      }
    })
  })

  /**
   * TransactionsAPI.update()
   */
  describe('update', () => {
    it('Updates a transaction', async () => {
      const txn       = transactionsData[0]
      const accountId = txn.accountId
      const txnId     = txn._id
      const url       = `http://localhost:5000/api/v1/accounts/${accountId}/transactions/${txnId}`
      const params    = {
        description: 'Updated Description',
        category:    'Dining',
        amount:      -888,
      }

      // Add mock implementation to simulate a server error
      axiosMock.put.mockImplementationOnce( (url, params) =>
        Promise.resolve({ data: {
          transaction: { ...txn, ...params } }
        }),
      )

      let transaction = await TransactionsAPI.update(accountId, txnId, params)

      expect(transaction.date).toBe(new Date(txn.date).toISOString())
      expect(transaction.description).toBe(params.description)
      expect(transaction.category).toBe(params.category)
      expect(transaction.amount).toBe(params.amount)
      expect(transaction._id).toBe(txn._id)
      expect(transaction.accountId).toBe(accountId)
      expect(transaction.userId).toBe(txn.userId)
    })

    it('Returns a 404 error for an invalid transaction id', async () => {
      const txn       = transactionsData[0]
      const accountId = txn.accountId
      const badTxnId  = 'XXX'
      const baseUrl   = `http://localhost:5000/api/v1`
      const url       = `${baseUrl}/${accountId}/transactions/${badTxnId}`
      const params    = {}
      const serverErr = { code: 404, message: 'Transaction not found' }

      // Add mock implementation to simulate a server error
      axiosMock.put.mockImplementationOnce((url, params) =>
        Promise.reject(serverErr),
      )

      try {
        let {transaction} = await TransactionsAPI.update(accountId, badTxnId, params)
        console.debug(`[debug]: transaction= `, transaction)
      }
      catch(error) {
        expect(error.server.code).toBe(404)
        expect(error.server.message).toMatch(/transaction not found/i)
      }
    })

    it('Returns a 400 error for invalid transaction parameters', async () => {
      const txn       = transactionsData[0]
      const accountId = txn.accountId
      const txnId     = txn._id
      const baseUrl   = `http://localhost:5000/api/v1`
      const url       = `${baseUrl}/accounts/${accountId}/transactions/${txnId}`
      const params    = {
        description:  '',
        amount:       'invalid-amount'
      }

      // Add mock implementation to simulate a server error
      axiosMock.put.mockImplementationOnce( (url, params) =>
        Promise.reject({ errors: [
            { code: 701, path: 'description', value: '', message: 'Description is required'},
            { code: 701, path: 'amount', value: 'invalid-amount', message: 'Amount is a number'},
          ]
        }),
      )

      try {
        let {transaction} = await TransactionsAPI.update(accountId, txnId, params)
      }
      catch(error) {
        expect(error[0].code).toBe(701)
        expect(error[0].path).toBe('description')
        expect(error[0].value).toBe('')
        expect(error[0].message).toMatch(/description is required/i)

        expect(error[1].code).toBe(701)
        expect(error[1].path).toBe('amount')
        expect(error[1].value).toBe('invalid-amount')
        expect(error[1].message).toMatch(/amount is a number/i)
      }
    })
  })
})
