// videoSyncWorker.js

let clients = [];

function broadcastMessage(message) {
  clients.forEach(client => client.postMessage(message));
}

onconnect = function(event) {
  const port = event.ports[0];

  clients.push(port);

  port.onmessage = function(event) {
    broadcastMessage(event.data);
  };

  port.start();
};
