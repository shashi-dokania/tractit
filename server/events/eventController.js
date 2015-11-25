var Event = require('./eventModel.js');
var Q = require('q');

module.exports = {

  getEventList: function (id, socket) {
    var findAll = Q.nbind(Event.find, Event);

    findAll({id: id})
    .then(function (event) {
      //console.log(event);
      socket.emit('retrieveEvent', event);
    })
    // .fail(function (error) {
    //   console.error(error);
    // });
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
  }

};
