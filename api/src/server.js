import express from 'express';
import amqp from 'amqplib';
import authenticationRouter from './routes/authentication';
import bodyParser from 'body-parser'

const app = express();
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

amqp.connect('amqp://localhost').then((conn) => {
    app.use('/authentication', authenticationRouter(conn));
}).catch((err) => {
    console.log('error connecting to RabbitMQ');
});

export default app;