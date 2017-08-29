import localforage from 'localforage';

var channelStore = localforage.createInstance({name: 'onekaymessenger_channels'});

function list() {
  var channels = [];
  return channelStore.iterate(function(value, key, num) {
    channels.push(value);
  }).then(function(value) {
    channels.sort(function(a, b) {
      if (a.last_updated === 0 && b.last_updated === 0) {
        // If both channels were not updated (yet), order alphabetically by name
        return a.name.localeCompare(b.name);
      }
      return parseFloat(a.last_updated) - parseFloat(b.last_updated);
    });
    return channels;
  });
}

const defaultDetails = {
  last_updated: 0,
  name: null,
  secret_key: null
};

function set(channel_id, details=null) {
  var _details = Object.assign({channel_id: channel_id}, defaultDetails, details);
  return channelStore.setItem(channel_id, _details);
}

export { list, set };
