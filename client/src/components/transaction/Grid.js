//-----------------------------------------------------------------------------
// client/src/components/transaction/Grid.js
//-----------------------------------------------------------------------------
import React          from 'react'
import numeral        from 'numeral'

import BootstrapTable from 'react-bootstrap-table-next'

/**
 * Component that returns a grid container a list of transactions.
 * 
 * @param {prop} transactions - Array of transactions
 */
const TransactionGrid = (props) => {
  ////////////////////////////////////
  // Currency format => '$0,0.00'
  ////////////////////////////////////
  const transactions = props.transactions
  const columns      = [
    {
      dataField:    'date',
      text:         'Date',
      formatter:    (cell) => {
        let dateObj = cell;
        if (typeof cell !== 'object') {
          dateObj = new Date(cell);
        }
        return `${('0' + (dateObj.getUTCMonth() + 1)).slice(-2)}/${('0' + dateObj.getUTCDate()).slice(-2)}/${dateObj.getUTCFullYear()}`;
      },
      align:        'center',
      headerAlign:  'center'
    }, 
    {
      dataField:    'description',
      text:         'Description',
      headerStyle:  { width: '40%' }
    }, 
    {
      dataField:    'category',
      text:         'Category',
    },
    {
      dataField:    'debit',
      text:         'Debit',
      formatter:    (num) => num === '' ? num : numeral(num).format('$0,0.00'),
      align:        'right',
      headerAlign:  'right'
    },
    {
      dataField:    'credit',
      text:         'Credit',
      formatter:    (num) => num === '' ? num : numeral(num).format('$0,0.00'),
      align:        'right',
      headerAlign:  'right'
    },
    {
      dataField:    'balance',
      text:         'Balance',
      formatter:    (num) => num === '' ? num : numeral(num).format('$0,0.00'),
      align:        'right',
      headerAlign:  'right'
    },
  ]

  /**
   * Render the transactions grid
   */
  return (
    <BootstrapTable keyField='_id' data={ transactions } columns={ columns } />
  )
}

// Export the TransactionGrid
export default TransactionGrid