var eventController = require('./eventController.js');

module.exports = function (app) {

  app.get('/', eventController.getEventList);
  app.post('/', eventController.postEvent);
};
