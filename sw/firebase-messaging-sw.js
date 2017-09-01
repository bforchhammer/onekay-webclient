// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.

// TODO figure out way to use webpack for compilation + use require()
// TODO => probably requires ejecting the webpack config and modifying it.
// Alternatively, maybe do custom registration of service worker with the code
// below as inline code (if that's possible somehow)...
importScripts('https://www.gstatic.com/firebasejs/4.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.2.0/firebase-messaging.js');
importScripts('https://cdnjs.cloudflare.com/ajax/libs/localforage/1.5.0/localforage.min.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  'messagingSenderId': "419343774138"
});
// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// Local storage handling for messages
var messageStore = localforage.createInstance({name: 'onekaymessenger_messages'});

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  var fcm_data = JSON.parse(payload['data']['payload']);
  payload = fcm_data['payload'];
  messageStore.setItem(payload.uuid, payload).catch(console.error);

  const notificationTitle = 'Message from ' + payload.creator.name;
  const notificationOptions = {
    icon: payload.creator.avatar,
    data: payload,
  };

  if (payload.content.type === 'text') {
    notificationOptions['body'] = payload.content.value;
  }
  else if (payload.content.type === 'image') {
    notificationOptions['image'] = payload.content.value;
  }
  else {
    notificationOptions['body'] = payload.content.type + ' message';
  }

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
// [END background_handler]

// It's possible to add action links to the notification (max 2 on chrome, see
// Notification.maxActions); add entries to notificationOptions "actions":
// * action: A DOMString identifying a user action to be displayed on the notification.
// * title: A DOMString containing action text to be shown to the user.
// * icon: A USVString containg the URL of an icon to display with the action.
// The check "event.action" in the event handler below.
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var payload = event.notification.data;

  event.waitUntil(async function() {
    const allClients = await clients.matchAll({
      includeUncontrolled: true
    });
    let chatClient;
    if (allClients.length > 0) {
      chatClient = allClients[0];
    }
    else {
      chatClient = await clients.openWindow();
    }

    // Tell the client to focus the window and show the respective message.
    chatClient.focus();
    chatClient.postMessage({message_received: payload});
  }());
}, false);
