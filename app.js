
let amqp = require('amqplib/callback_api');
let mqUri = require('./setup/amqp').ampq_uri;
let mongoUri = require('./setup/database').nomgodb_uri;
let MongoClient = require('mongodb').MongoClient
let assert = require('assert');
const express = require('express')
const bodyParser = require('body-parser')

function connectToBroker() {
  amqp.connect(mqUri, function(err, conn) {
      if(err){
          console.log("connect to broker err %s", err);
          console.log("retry to connect in 5 secs ...");
          setTimeout(function() {
              connectToBroker();
          }, 5000);
      }else {
        conn.createChannel(function (err, ch) {
          if (err) {
              console.log("create channel err %s", err);
          } else {
              console.log("sukses bikin channel");
              exports.chnannel = ch;
          }
        });
          console.log("connect to broker sukses");
          MongoClient.connect(mongoUri, function(err, database) {
            if(err) {
              console.log("Connected to server failed "+err);
            }else {
              exports.db = database.db('pertanian')
              
              app = express();
              cors = require('cors')
              
              const corsTypeTwo = (req, res, next) => {
                res.header('Access-Control-Allow-Origin', '*')
                res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
                res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
                next()
              }
              
              
              const android_basic = require('./routes/routes')
              const android_auth = require('./routes/routes_auth')
              const webside_user = require('./routes/routes_user')
              const webside_basic = require('./routes/routes_webside')

              app.use(cors())
              app.use(corsTypeTwo)
              app.use(bodyParser.json())
              app.use(bodyParser.urlencoded({extended: true}))
          
            
              app.use('/basic', android_basic)
              app.use('/web', webside_basic)
              app.use('/auth', android_auth)
              app.use('/user', webside_user)
              
              
              let server = require('http').createServer();
              console.log("Connected to db sukses ");
              const port = 5013
          
              app.listen(port, function(){
                  console.log('Listening on port ' + port);
              });
              console.log("Connected to server");
              
            }
          });
      }
  });
}

connectToBroker();