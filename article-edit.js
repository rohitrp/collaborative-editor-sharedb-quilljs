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
  // var quill = new Quill('#editor', {theme: 'snow'});

  var toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
  
    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction
  
    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],
  
    ['clean'],
    ['link', 'image', 'video']                                        // remove formatting button
  ];
  
  var quill = new Quill('#editor', {
    modules: {
      toolbar: toolbarOptions
    },
    theme: 'snow'
  });
  
  quill.setContents(doc.data);
  quill.on('text-change', function(delta, oldDelta, source) {
    if (source !== 'user') return;
    doc.submitOp(delta, {source: quill});
  });
  doc.on('op', function(op, source) {
    if (source === quill) return;
    quill.updateContents(op);
  });
});
