import localforage from 'localforage';

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

function list() {
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

function add(message) {
  return messageStore.setItem(message.uuid, message);
}

export { list, add };
