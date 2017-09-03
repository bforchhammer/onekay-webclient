import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ListGroup, Image } from 'react-bootstrap';
import ScrollBars from 'react-custom-scrollbars';
import Message from '../Message';
import './index.css';


class CustomScrollBars extends Component {
  componentDidMount() {
    this.scrollBars.scrollToBottom();
  }
  componentDidUpdate() {
    this.scrollBars.scrollToBottom();
  }

  render() {
    return (
      <ScrollBars ref={(el) => {this.scrollBars = el}}>
         {this.props.children}
      </ScrollBars>
    )
  }
}


class MessagesList extends Component {
  render() {
    if (!this.props.data.length) {
        return (
            <div>No messages yet.</div>
        )
    }

    return (
      <CustomScrollBars>
        <div className="message-list">
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
        </div>
      </CustomScrollBars>
    )
  }
}

MessagesList.propTypes = {
  data: PropTypes.array.isRequired,
};

export default MessagesList;
