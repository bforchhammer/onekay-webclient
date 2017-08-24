import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-bootstrap';
import timeago from 'timeago.js';

class Message extends Component {
  render() {
    return (
      <li className="list-group-item">
        <div className="message-content">
          {this.props.children}
        </div>
        <div className="message-footer">
          <Image src={this.props.creator.avatar} circle width="24" height="24" />
          <span className="name">{this.props.creator.name}</span>
          <span className="timestamp">{timeago().format(this.props.timestamp)}</span>
        </div>
      </li>
    );
  }
}

Message.propTypes = {
  creator: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string
  }),
  timestamp: PropTypes.number.isRequired
}

export default Message;
