import localforage from 'localforage';
import * as channelStore from './channels';

// Local storage handling for messages
var messageStore = localforage.createInstance({name: 'onekaymessenger_messages'});

function list(channel) {
  var messages = [];
  return messageStore.iterate(function(value, key, num) {
    channelStore.set(value.channel_id); // Ensure the channel id is in the list of channels
    if (value.channel_id === channel) {
      messages.push(value);
    }
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
