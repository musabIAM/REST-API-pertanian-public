const mongoose = require('mongoose')
let mongoUri = require('../setup/database').nomgodb_uri;
let abstein_uri = require('../setup/database').abstein_uri;

module.exports = {
  db: function () {
    return mongoose.createConnection(mongoUri, { keepAlive: 1, connectTimeoutMS: 30000, reconnectTries: 30, reconnectInterval: 5000, useNewUrlParser: true })
  },
  abstein: function () {
    return mongoose.createConnection(abstein_uri, { keepAlive: 1, connectTimeoutMS: 30000, reconnectTries: 30, reconnectInterval: 5000, useNewUrlParser: true })
  }
}
