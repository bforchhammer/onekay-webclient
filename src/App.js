import React, { Component } from 'react';

import { Grid, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-theme.css'

import MessagesList from './components/MessagesList';
import MessageForm from './components/MessageForm';

import './App.css';

import firebase from "firebase";
import 'whatwg-fetch';
import localforage from 'localforage';
import uuidv4 from 'uuid/v4';

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

// Local storage handling for messages
var messageStore = localforage.createInstance({name: 'onekaymessenger_messages'});

// Migration of messages from previous storage implementation
localforage.getItem('messages').then(function(messages) {
  if (messages !== null) {
    for (var i=0; i < messages.length; i++) {
      var value = messages[i];
      if (typeof(value) === 'object' && value !== null) {
        messageStore.setItem(value.uuid, value);
      }
    }
  }
  localforage.removeItem('messages');
});

function getMessages() {
  var messages = [];
  return messageStore.iterate(function(value, key, num) {
    messages.push(value);
  }).then(function(value) {
    messages.sort(function(m1, m2) {
      return parseFloat(m1.timestamp) - parseFloat(m2.timestamp);
    });
    return messages;
  });
}

var updateAppState = function() {
  // "this" is be bound to the app instance below
  var app = this;
  getMessages().then(function(messages) {
    app.setState({messages: messages});
  }).catch(console.error);
}

function storeMessage(message) {
  return messageStore.setItem(message.uuid, message);
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
    // TODO: investigate messaging.setBackgroundMessageHandler as alternative to local storage
    messaging.onMessage(function(payload) {
      console.log("Message received. ", payload);
      var fcm_data = JSON.parse(payload['data']['payload']);
      payload = fcm_data['payload'];
      storeMessage(payload).then(updateAppState).catch(console.error);
    });
  });

function sendMessage(message) {
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
        channel: 'channel_general',
        type: 'text',
        message: message
      })
    });
  });
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {messages: []};
    updateAppState = updateAppState.bind(this);
  }

  componentDidMount() {
    // Reload when window gets focused (messages may have been received in the
    // background)
    window.addEventListener("focus", updateAppState);
    updateAppState();
  }

  componentWillUnmount() {
    window.removeEventListener("focus", updateAppState);
  }

  render() {
    return (
      <div>
        <Navbar inverse fixedTop>
          <Grid>
            <Navbar.Header>
              <Navbar.Brand>
                <a href="/">OneKay Web Client</a>
              </Navbar.Brand>
              <Navbar.Toggle/>
            </Navbar.Header>
          </Grid>
        </Navbar>
        <Grid className="main-content">
          <MessagesList data={this.state.messages}/>
          <MessageForm sendMessageFn={sendMessage}/>
        </Grid>
      </div>
    );
  }
}

export default App;
