//-----------------------------------------------------------------------------
// client/src/components/account/summary.js
//-----------------------------------------------------------------------------
import React      from 'react'
import {
  Container,
  Col,
  Row,
}                 from 'react-bootstrap'
import PropTypes  from 'prop-types'

/**
 * Component that provides a high-leve summary of an account.
 * 
 * @prop {string} nickname           - User defined nickname for account.
 * @prop {string} financialInstitute - FI where account is located.
 * @prop {enum}   accountType        - Checking, Savings, or Credit Card
 * @prop {number} balance            - Current account balance.
 * @prop {date}   asOfDate           - Date of balance (last txn).
 */
const AccountSummary = (props) => {
  let name                = props.name
  let financialInstitute  = props.financialInstitute
  let balance             = props.balance

  return (
    <Container fluid>
      <Row style={{border:'1px solid grey', borderRadius:5, padding:'1.0rem', margin:'1.0rem'}}>
        <Col xs={8}>
          <h2 style={{color:'red', textAlign:'left', fontSize:'1.20rem'}}>{name}</h2>
          <h6 style={{textAlign:'left'}}>{financialInstitute}</h6>
        </Col>
        <Col>
          <div style={{textAlign:'right', fontSize:36}}>
            {balance}
          </div>
        </Col>
      </Row>
    </Container>
  )
}

// PropTypes
AccountSummary.propTypes = {
  name:               PropTypes.string.isRequired,
  financialInstitute: PropTypes.string.isRequired,
  balance:            PropTypes.number.isRequired,
  accountType:        PropTypes.oneOf(['Checking', 'Savings', 'Credit Card']),
  asOfDate:           PropTypes.instanceOf(Date)
};

// Export the AccountSummary
export default AccountSummary
