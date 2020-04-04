//-----------------------------------------------------------------------------
// client/src/pages/accounts/__tests__/accounts-page.test.js
//-----------------------------------------------------------------------------
import React              from 'react'

import {
  render,
  cleanup,
  waitForElement,
}                         from '@testing-library/react'

import accountsApiMock    from '../../../api/accounts-api'
jest.mock('../../../api/accounts-api') 

import AccountsPage       from '../accounts-page'

// Mock account data
const accountsData = [
  { 
    _id:                '1', 
    name:               'Test Checking Account', 
    financialInstitute: 'Bank', 
    type:               'Checking', 
    balance:            100.00,
    initialDate:        '2020-03-31T07:00:00.000Z',
    userId:             'Me'
  },
  { 
    _id:                '2', 
    name:               'Test Credit Card', 
    financialInstitute: 'Credit Union', 
    type:               'Credit Card', 
    balance:            500.00,
    initialDate:        '2020-03-31T07:00:00.000Z',
    userId:             'Me',
  }
]

///////////////////////////////////////////////////////////////////////////////
// TODO: 04/03/2020
// ADD THE FOLLOWING TEST FUNCTIONALITIES
// - VERIFY THE PAGE TITLE
// - VERIFY THE ADD ACCOUNT BUTTON
// - FIGURE OUT THE BEST WAY TO CLEANUP AXIOS MOCKS
//
// TEST THE CREATE ACCOUNT MODAL
// - LAUNCH MODAL, CREATE ACCOUNT, VERY ACCOUNT LIST IS UPDATED
///////////////////////////////////////////////////////////////////////////////
describe('AccountsPage', () => {
  afterEach( () => {
    jest.resetAllMocks()
  })

  it('Returns a list of accounts', async () => {
    // Mock the fetch call by passing in an array of accountsData
    accountsApiMock.get.mockResolvedValueOnce(accountsData)

    const { getAllByTestId } = render(<AccountsPage />)

    const rowValues = await waitForElement( () => getAllByTestId('row') )

    expect(accountsApiMock.get).toHaveBeenCalledTimes(1)
    expect(rowValues.length).toBe(2)
    expect(rowValues[0].querySelector('h2')).toHaveTextContent(accountsData[0].name)
    expect(rowValues[0].querySelector('h6')).toHaveTextContent(accountsData[0].financialInstitute)
    expect(rowValues[1].querySelector('h2')).toHaveTextContent(accountsData[1].name)
    expect(rowValues[1].querySelector('h6')).toHaveTextContent(accountsData[1].financialInstitute)
  })
})