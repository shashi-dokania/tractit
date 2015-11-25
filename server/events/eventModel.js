var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
  id: String,
  friends: [{
    id: String,
    name: String
  }],
  address: String,
  description: String,
  startTime: String,
  endTime: String,
  date : String,
  createdBy: String
});

module.exports = mongoose.model('events', eventSchema);
