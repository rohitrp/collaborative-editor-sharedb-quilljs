var sharedb = require('sharedb/lib/client');
var richText = require('rich-text');
var Quill = require('quill');
sharedb.types.register(richText.type);

// Open WebSocket connection to ShareDB server
var socket = new WebSocket('ws://' + window.location.host);
var connection = new sharedb.Connection(socket);

// For testing reconnection
window.disconnect = function() {
  connection.close();
};
window.connect = function() {
  var socket = new WebSocket('ws://' + window.location.host);
  connection.bindToSocket(socket);
};

var doc = connection.get('collaborative_community', id);
doc.subscribe(function(err) {
  if (err) throw err;

  var quill = new Quill('#editor', {
    readOnly: true,
    modules: {
      toolbar: '#toolbar'
    },  
    theme: 'snow'
  });
  
  quill.setContents(doc.data);

  // Change view of article if it gets edited in realtime
  doc.on('op', function(op, source) {
    if (source === quill) return;
    quill.updateContents(op);
  });

  document.getElementById('toolbar').outerHTML = "";  
});
