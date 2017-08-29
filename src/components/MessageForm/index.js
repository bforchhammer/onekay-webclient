import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

const emptyString = '';

class MessageForm extends Component {
  constructor(props) {
    super(props);
    this.state = {value: null, disabled: false};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.focusInput = this.focusInput.bind(this);
  }

  getValidationState() {
    if (this.state.value !== null) {
      const length = this.state.value.length;
      if (length === 0) return 'error';
      return 'success';
    }
    return null;
  }

  handleChange(event) {
    this.setState({value: event.target.value, disabled: false});
  }

  setDisabled(value) {
    this.setState((prevState) => ({value: prevState.value, disabled: value}));
  }

  focusInput() {
    this.textInput.focus();
  }

  handleSubmit(e) {
    e.preventDefault();

    // If we fail validation, stop now.
    if (this.getValidationState() !== "success") {
      console.log("Form validation error");
      return false;
    }

    // Disable form, try to send, then re-enable...
    this.setDisabled(true);

    var component = this;
    this.props.sendMessageFn(this.state.value)
      .then(function() {
        component.setState({value: null, disabled: false});
        component.focusInput();
      })
      .catch(function(err) {
        console.error("Failed to submit message", err);
        component.setDisabled(false);
        component.focusInput();
      });
  }

  render() {
    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormGroup bsSize="lg" controlId="formBasicText" validationState={this.getValidationState()}>
          <Col componentClass={ControlLabel} sm={2}>
            Message:
          </Col>
          <Col sm={10}>
            <FormControl type="text"
                         placeholder="Enter message"
                         value={this.state.value || emptyString}
                         onChange={this.handleChange}
                         disabled={this.state.disabled}
                         inputRef={(el) => { this.textInput = el; }}
                         autoFocus={true} />
            <FormControl.Feedback />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col smOffset={2} sm={10}>
            <Button type="submit" disabled={this.state.disabled}>Send</Button>
          </Col>
        </FormGroup>
      </Form>
    )
  }
}

MessageForm.propTypes = {
  sendMessageFn: PropTypes.func.isRequired
};

export default MessageForm;
