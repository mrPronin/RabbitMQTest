import express from 'express';
import bodyParser from 'body-parser'
import { Buffer } from 'buffer';

const router = express.Router();
router.use(bodyParser.json());

let authRouter = (conn) => {
    router.post('/', (req, res) => {
        if (req.query.error) {
            res.status(400);
            res.json({ error: 'default error' });
        } else {
            conn.createChannel().then((ch) => {
                const apiQueueName = 'api-authentication-queue';
                const serviceQueueName = 'service-authentication-queue';
                console.log('login: ' + req.body.login + ' password: ' + req.body.password);
                // ch.sendToQueue(apiQueueName, new Buffer('auth_request'));
                let auth_request_string = 'login: ' + req.body.login + ' password: ' + req.body.password
                let buffer = new Buffer()
                ch.sendToQueue(apiQueueName, new Buffer(auth_request_string));

                ch.consume(serviceQueueName, (msg, err) => {
                    if (msg !== null) {
                        ch.ack(msg);
                        res.json({ msg: msg.content.toString() });
                    }
                    ch.close();
                });
            }).catch(err => console.log(err));
        }
    });
    return router;
};
export default authRouter;