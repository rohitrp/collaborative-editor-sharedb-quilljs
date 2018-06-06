var http = require('http');
var express = require('express');
var ShareDB = require('sharedb');
var richText = require('rich-text');
var WebSocket = require('ws');
var WebSocketJSONStream = require('websocket-json-stream');

ShareDB.types.register(richText.type);

const db = require('sharedb-mongo')('mongodb://localhost:27017/test');
var backend = new ShareDB({db});

var app = express();
app.use(express.static('static'));
app.use(express.static('node_modules/quill/dist'));

app.set('view engine', 'ejs');

var connection = backend.connect();

// Create a web server to serve files and listen to WebSocket connections
var server = http.createServer(app);

// Connect any incoming WebSocket connection to ShareDB
var wss = new WebSocket.Server({server: server});
wss.on('connection', function(ws, req) {
  var stream = new WebSocketJSONStream(ws);
  backend.listen(stream);
});

app.get('/edit/:id', function(req, res) {
  var doc = connection.get('collaborative_community', req.params.id);
  doc.fetch(function(err) {
    if (err) throw err;
    if (doc.type === null) {
      doc.create([{insert: 'Hi!'}], 'rich-text');
      return;
    }
  });
  res.render('index.ejs', {'id': req.params.id});
})

app.get('/view/:id', function(req, res) {
  res.render('view.ejs', {'id': req.params.id});
});

server.listen(8080);
console.log('Listening on http://localhost:8080');
