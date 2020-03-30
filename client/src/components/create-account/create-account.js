//-----------------------------------------------------------------------------
// client/src/components/create-account/create-account.js
//-----------------------------------------------------------------------------
import React, { useState }  from 'react'
import {
  Modal,
  Button,
}                           from 'react-bootstrap'

/**
 * Modal to add a new account to the dough app.
 */
function CreateAccountModal(props) {

  /**
   * Render the add account modal
   */
  return (
    <Modal show={props.show} onHide={props.onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add a New Account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Modal body goes here</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary'>Close</Button>
        <Button variant='primary'>Save</Button>
      </Modal.Footer>
    </Modal>
  )
}

// Export the create account modal
export default CreateAccountModal