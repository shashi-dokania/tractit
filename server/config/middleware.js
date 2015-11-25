// var morgan = require('morgan');
// var bodyParser = require('body-parser');
// // var events = require('../events/eventRoutes.js');
// // var eventController = require('../events/eventController.js');

// module.exports = function (app, express) {

//   var eventRouter = express.Router();

//   app.use(morgan('dev'));

//    // json and url parser
//   app.use(bodyParser.urlencoded({ extended: true }));
//   app.use(bodyParser.json());
//   // app.use(express.static(__dirname + '/../www'));

//   // creating routers for each page
//   // app.use('/api/events', eventRouter);

//   // logging error
//   app.use(function (error, request, response, next) {
//     console.error(error.stack);
//     next(error);
//   });

//   // to send error to the client
//   app.use(function (error, request, response, next) {
//     console.log('inside error');
//     response.status(500).send({ error: error.message });
//   });

//   // events(eventRouter);

// };
