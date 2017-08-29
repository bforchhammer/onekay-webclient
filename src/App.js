import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import { Grid, Row, Col, Tab, Nav, NavItem } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-theme.css'

import './App.css';

import firebase from "firebase";
import 'whatwg-fetch';
import localforage from 'localforage';
import uuidv4 from 'uuid/v4';

import * as channelStore from './stores/channels';
import * as messageStore from './stores/messages';

import MessagesList from './components/MessagesList';
import MessageForm from './components/MessageForm';

localforage.config({name: 'onekay-messenger'});

function sendTokenToServer(token) {
  localforage.setItem('token', token);
  fetch('https://onekay.herokuapp.com/messages/subscribe', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({channel: 'channel_general', 'registration_token': token})
  }).then(function(response) {
    console.log("Channel subscription result", response)
  })
}

function setTokenSentToServer(status) {
  localforage.setItem("token-sent-to-server", status);
}

function updateUIForPushEnabled() {
  console.log("TODO: implement updateUIForPushEnabled");
}

function updateUIForPushPermissionRequired() {
  console.log("TODO: implement updateUIForPushPermissionRequired");
}

function showToken(message, err) {
  console.log("TODO implement showToken", message, err)
}

var updateAppState = function() {
  var channel = "channel_general";
  var app = this;  // "this" is be bound to the app instance below
  messageStore.list(channel).then(function(messages) {
    app.setState((prevState) => {
      return Object.assign({}, prevState, {messages: messages});
    });
  }).catch(console.error);

  channelStore.list().then(function(channels) {
    app.setState((prevState) => {
      return Object.assign({}, prevState, {channels: channels});
    });
  }).catch(console.error);
}

// Initialize firebase
var config = {
  apiKey: "AIzaSyDQOm3taDDKhjgdAwG3WaaXqWqW43OeCEY",
  authDomain: "onekay-267e7.firebaseapp.com",
  databaseURL: "https://onekay-267e7.firebaseio.com",
  projectId: "onekay-267e7",
  storageBucket: "onekay-267e7.appspot.com",
  messagingSenderId: "419343774138"
};
firebase.initializeApp(config);

// Retrieve Firebase Messaging object.
navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/sw/firebase-messaging-sw.js`)
  .then((registration) => {
    const messaging = firebase.messaging();
    messaging.useServiceWorker(registration);

    messaging.requestPermission()
    .then(function() {
      console.log('Notification permission granted.');

      // Get Instance ID token. Initially this makes a network call, once retrieved
      // subsequent calls to getToken will return from cache.
      messaging.getToken()
      .then(function(currentToken) {
        if (currentToken) {
          sendTokenToServer(currentToken);
          updateUIForPushEnabled(currentToken);
        } else {
          // Show permission request.
          console.log('No Instance ID token available. Request permission to generate one.');
          // Show permission UI.
          updateUIForPushPermissionRequired();
          setTokenSentToServer(false);
        }
      })
      .catch(function(err) {
        console.log('An error occurred while retrieving token. ', err);
        showToken('Error retrieving Instance ID token. ', err);
        setTokenSentToServer(false);
      });
    })
    .catch(function(err) {
      console.log('Unable to get permission to notify.', err);
    });

    // Callback fired if Instance ID token is updated.
    messaging.onTokenRefresh(function() {
      messaging.getToken()
      .then(function(refreshedToken) {
        console.log('Token refreshed.');
        // Indicate that the new Instance ID token has not yet been sent to the
        // app server.
        setTokenSentToServer(false);
        // Send Instance ID token to app server.
        sendTokenToServer(refreshedToken);
      })
      .catch(function(err) {
        console.log('Unable to retrieve refreshed token ', err);
        showToken('Unable to retrieve refreshed token ', err);
      });
    });

    // Handle incoming messages. Called when:
    // - a message is received while the app has focus
    // - the user clicks on an app notification created by a sevice worker
    //   `messaging.setBackgroundMessageHandler` handler.
    messaging.onMessage(function(payload) {
      var fcm_data = JSON.parse(payload['data']['payload']);
      payload = fcm_data['payload'];
      console.log("Message received. ", payload);
      messageStore.add(payload).then(updateAppState).catch(console.error);
    });
  });

function sendMessage(channel_id, message) {
  return localforage.getItem('token').then(function(token) {
    return fetch('https://onekay.herokuapp.com/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Uuid': token,
        'User-Name': 'Webclient ' + token.substr(0, 5),
        'User-Avatar': 'https://robohash.org/' + token.substr(0, 10)
      },
      body: JSON.stringify({
        client_message_uuid: uuidv4(),
        channel: channel_id,
        type: 'text',
        message: message
      })
    });
  });
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {messages: [], channels: []};
    updateAppState = updateAppState.bind(this);
  }

  componentDidMount() {
    window.addEventListener("focus", updateAppState);
    updateAppState();
  }

  componentWillUnmount() {
    window.removeEventListener("focus", updateAppState);
  }

  componentDidUpdate() {
    var tabContentElement = ReactDOM.findDOMNode(this.tabContentElement);
    tabContentElement.scrollTop = tabContentElement.scrollHeight;
  }

  sendMessage = (message) => {
    var active_channel = "channel_general";
    return sendMessage(active_channel, message);
  }

  render() {
    return (
      <Grid className="main-grid">
        <Row className="header">
          <Col xs={9} sm={9} md={9} lg={9}>
            OneKay Messenger
          </Col>
          <Col xs={3} sm={3} md={3} lg={3} className="header-user-info">
            User info?
          </Col>
        </Row>
        <Tab.Container id="channels" defaultActiveKey={"channel_general"}>
          <Row>
            <Col xs={3} sm={3} md={3} lg={3} className="channels-tabs">
              <Nav bsStyle="pills" stacked>
                {
                  this.state.channels.map(item => {
                    return (
                      <NavItem key={"tab:" + item.channel_id} eventKey={item.channel_id}>{item.channel_id}</NavItem>
                    )
                  })
                }
              </Nav>
            </Col>
            <Col xs={9} sm={9} md={9} lg={9} className="channels-content" ref={(el) => { this.tabContentElement = el; }}>
              <Tab.Content animation>
                {
                  this.state.channels.map(item => {
                    return (
                      <Tab.Pane key={"pane:" + item.channel_id} eventKey={item.channel_id}>
                        <MessagesList data={this.state.messages}/>
                      </Tab.Pane>
                    )
                  })
                }
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
        <Row className="footer">
          <Col xs={3} sm={3} md={3} lg={3}>
            Footer
          </Col>
          <Col xs={9} sm={9} md={9} lg={9}>
            <MessageForm sendMessageFn={this.sendMessage}/>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default App;
