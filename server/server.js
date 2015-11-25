var express = require('express');
var mongoose = require('mongoose');
// var middleware = require('./config/middleware.js');
var eventController = require('./events/eventController.js');
var http = require('http');

var app = express();

// app.use(express.static(__dirname + '/../www'));
mongoose.connect('mongodb://localhost/tracker'); //process.env.CUSTOMCONNSTR_MONGOLAB_URI || 
// var db = mongoose.connection;

// db.on('error', function (err) {
// console.log('connection error', err);
// });
// db.once('open', function () {
// console.log('connected.');
// });

// middleware(app, express);

var port = process.env.PORT || 8000;



var server = http.createServer(app);
var io = require('socket.io')(server);

server.listen(port);

console.log('listening to port', port);

// Sockets
var storage = {};

io.on('connection', function (socket) {
  //console.log('connected to socket in server......', socket);
  // socket.on('init', function (data) {
  //   console.log('connected to socket on init in server......', data);
  //   socket.join('/' + data);
  //   storage[data] = {};
    socket.on('formData', function (eventInfo) {
      console.log("inside socket....", eventInfo);
      eventController.postEvent(eventInfo);
      
      // db.tracker.insert(eventInfo);
      //storage[data][info.id] = info;
      //socket.emit('serverData', storage[data]);
    });
    // socket.on('logout', function (info) {
    //   delete storage[data][info];
    //   socket.leave('/' + data);
    //   socket.emit('serverData', storage[data]);
    // });
  //});
    socket.on('getEvents', function(id) {
      console.log('id from get events in server file......', id);
      eventController.getEventList(id, socket);
    });
});

module.exports = app;
