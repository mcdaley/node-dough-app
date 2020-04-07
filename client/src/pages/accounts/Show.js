//-----------------------------------------------------------------------------
// client/src/pages/accounts/Show.js
//-----------------------------------------------------------------------------
import React                      from 'react'
import { Container, Button }      from 'react-bootstrap'
import { useParams, useHistory }  from 'react-router-dom'

/**
 * 
 */
const PagesAccountsShow = () => {
  let { id }    = useParams()
  let history   = useHistory()

  const handleClick = () => {
    console.log('Navigate back to the previous page')
    history.goBack()
  }

  return (
    <Container>
      <h1>Dough Account Details Page</h1>
      <p>{id}</p>
      <Button variant='primary' onClick={handleClick}>
        Go Back
      </Button>
    </Container>
  )
}

// Export the account details page
export default PagesAccountsShow