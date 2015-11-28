var Event = require('./eventModel.js');
var Q = require('q');

module.exports = {

  getEventList: function (id, socket) {
    var findAll = Q.nbind(Event.find, Event);
    // find all id that matches user and the friends
    findAll({ $or: [ { "id": id }, { "friends.id": id } ] })
    .then(function (event) {
      console.log(event);
      socket.emit('retrieveEvent', event);
    })
    .fail(function (error) {
      console.error(error);
    });
  },

  postEvent: function (info) {

    var id = info.id;
    var friends = info.friends;
    var description = info.description;
    var address = info.address;
    var startTime = info.startTime;
    var endTime = info.endTime;
    var date = info.date;
    var createdBy = info.name;
    
    console.log('id', id, 'friends', friends, 'address', address, 'date', date, 'startTime', startTime);
    var create;
    var newEvent;

    var newEvent = new Event({
      id: id,
      friends: friends,
      description: description,
      address: address,
      startTime: startTime,
      endTime: endTime,
      date: date,
      createdBy: createdBy
    });

    newEvent.save(function (error, event) {
      if (error) {
        console.error(error);
      }
    });
  },

  deleteEvent: function (event) {
    Event.remove({"id": event.id});
  },

  updateLocation: function (coords) {

    Event.find({ $or: [ { "id": coords.id }, { "friends.id": coords.id } ] }, function (error, docs) {
      if (error) {
        console.log(error);
      }
      for ( var i = 0; i < docs.length; i++ ) {
        console.log('inside for loop....', docs[i].friends[0].id)

        if ( docs[i].id === coords.id ) {
          docs[i].latitude = coords.latitude;
          docs[i].longitude = coords.longitude;
          console.log('updating from base....')
        }
        for (var j = 0; j < docs[i].friends.length; j++ ) {
          if ( docs[i].friends[j].id === coords.id ) {
            docs[i].friends[j].latitude = coords.latitude;
            docs[i].friends[j].longitude = coords.longitude;
            console.log('updating from friends....'); 
          }
        }
        docs[i].save();
      }
    });
  }

};
