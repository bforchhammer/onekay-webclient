import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ListGroup, Image } from 'react-bootstrap';
import Message from '../Message';
import './index.css';

class MessagesList extends Component {
  componentDidUpdate() {
    // For now, simply scroll to bottom of screen, because that's where new
    // messages are added...
    window.scrollTo(0, 100000000);
  }

  render() {
    if (!this.props.data.length) {
        return (
            <div>No messages yet.</div>
        )
    }

    return (
      <ListGroup componentClass="ul">
        {
          this.props.data.map(item => {
            if (item.content.type === 'text') {
              return (
                <Message key={item.uuid} creator={item.creator} timestamp={item.timestamp}>
                  <div className="message">{item.content.value}</div>
                </Message>
              )
            }
            else if (item.content.type === 'image') {
              return (
                <Message key={item.uuid} creator={item.creator} timestamp={item.timestamp}>
                  <Image src={item.content.value} />
                </Message>
              )
            }
            else {
              return (
                <Message key={item.uuid} creator={item.creator} timestamp={item.timestamp}>
                  <pre>{item.content}</pre>
                </Message>
              )
            }
          })
        }
      </ListGroup>
    )
  }
}

MessagesList.propTypes = {
  data: PropTypes.array.isRequired,
};

export default MessagesList;
