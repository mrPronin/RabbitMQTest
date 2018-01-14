// import amqp from 'amqplib';

const apiQueueName = 'api-authentication-queue';
const serviceQueueName = 'service-authentication-queue';

var open = require('amqplib').connect('amqp://localhost');

// Publisher
function auth_response() {
  open.then(function(conn) {
    return conn.createChannel();
  }).then(function(ch) {
    return ch.assertQueue(serviceQueueName).then(function(ok) {
      return ch.sendToQueue(serviceQueueName, new Buffer('auth_response'));
    });
  }).catch(console.warn);
}

// Consumer
open.then(function(conn) {
  return conn.createChannel();
}).then(function(ch) {
  return ch.assertQueue(apiQueueName).then(function(ok) {
    return ch.consume(apiQueueName, function(msg) {
      if (msg !== null) {
        console.log(msg.content.toString());
        ch.ack(msg);
        auth_response();
      }
    });
  });
}).catch(console.warn);