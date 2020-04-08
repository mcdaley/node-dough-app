//-----------------------------------------------------------------------------
// client/src/api/__tests__/transactions-api.test.js
//-----------------------------------------------------------------------------
import axiosMock        from 'axios'
import TransactionsAPI  from '../transactions-api'

jest.mock('axios')      // https://jestjs.io/docs/en/mock-functions#mocking-modules

// Mock transactoin data for an account
const transactionsData = [
  { 
    _id:          '1',
    date:         '2020-03-31T07:00:00.000Z',
    description:  'Transaction One', 
    category:     'Groceries', 
    charge:       'debit', 
    amount:       100.00,
    accountId:    '99',
    userId:       'Me'
  },
  { 
    _id:          '2',
    date:         '2020-04-01T07:00:00.000Z',
    description:  'Transaction Two', 
    category:     'Household', 
    charge:       'debit', 
    amount:       55.55,
    accountId:    '99',
    userId:       'Me'
  }
]

describe('Transactions API', () => {
  afterEach( () => {
    axiosMock.get.mockClear()
    //* axiosMock.post.mockClear()
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
      expect(transactions.length).toBe(2)
      expect(transactions[0].description).toBe(transactionsData[0].description)
      expect(transactions[1].description).toBe(transactionsData[1].description)
    })
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
