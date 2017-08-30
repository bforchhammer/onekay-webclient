import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, FormGroup, FormControl } from 'react-bootstrap';

import './index.css';

const emptyString = '';

class ChannelJoinForm extends Component {
  constructor(props) {
    super(props);
    this.state = {value: null, disabled: false};
  }

  getValidationState() {
    if (this.state.value !== null) {
      const length = this.state.value.length;
      if (length === 0) return 'error';
      return 'success';
    }
    return null;
  }

  setDisabled(value) {
    this.setState((prevState) => ({value: prevState.value, disabled: value}));
  }

  handleChange = (event) => {
    this.setState({value: event.target.value, disabled: false});
  }

  handleSubmit = (e) => {
    e.preventDefault();

    // If we fail validation, stop now.
    if (this.getValidationState() !== "success") {
      console.log("Channel-Join Form validation error");
      return false;
    }

    // Disable form, try to send, then re-enable...
    this.setDisabled(true);

    var component = this;
    this.props.joinChannelFn(this.state.value)
      .then(function() {
        component.setState({value: null, disabled: false});
      })
      .catch(function(err) {
        console.error("Failed to join channel", err);
        component.setDisabled(false);
      });
  }

  render() {
    return (
      <Form inline onSubmit={this.handleSubmit} className="join_channel_form">
        <FormGroup controlId="joinChannelInput" validationState={this.getValidationState()}>
          <FormControl type="text"
                       placeholder="Enter channel UUID"
                       value={this.state.value || emptyString}
                       onChange={this.handleChange}
                       disabled={this.state.disabled}
                       inputRef={(el) => { this.textInput = el; }} />
        </FormGroup>
        <FormGroup>
          <Button type="submit" disabled={this.state.disabled}>Join</Button>
        </FormGroup>
      </Form>
    )
  }
};

ChannelJoinForm.propTypes = {
  joinChannelFn: PropTypes.func.isRequired
};

export default ChannelJoinForm;
