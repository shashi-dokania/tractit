var express = require('express');
var mongoose = require('mongoose');
var eventController = require('./events/eventController.js');
var http = require('http');

var app = express();

mongoose.connect(process.env.CUSTOMCONNSTR_MONGOLAB_URI || 'mongodb://localhost/tracker');

var port = process.env.PORT || 8000;

var server = http.createServer(app);
var io = require('socket.io')(server);

server.listen(port);

console.log('listening to port', port);

// Sockets
io.on('connection', function (socket) {
  socket.on('formData', function (eventInfo) {
    // console.log("inside socket....", eventInfo);
    eventController.postEvent(eventInfo);
  });

  socket.on('getEvents', function (id) {
    // console.log('id from get events in server file......', id);
    eventController.getEventList(id, socket);
  });

  socket.on('deleteEvent', function (event) {
    // console.log("inside socket delete event....", event);
    eventController.deleteEvent(event, socket);
  });

  socket.on('updateCoords', function (coords) {
    // console.log("inside socket updateCoords....", coords);
    eventController.updateLocation(coords);
  });
});

module.exports = app;
