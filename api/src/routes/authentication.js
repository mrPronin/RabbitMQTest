import express from 'express';
import bodyParser from 'body-parser'
import { Buffer } from 'buffer';

// Validation
import Ajv from 'ajv';
const ajv = new Ajv();
let schema = {
    "type": "object",
    "properties": {
      "login": { "type": "string" },
      "password": { "type": "string" }
    },
    "required": [ "login", "password" ]
  };
  const validate = ajv.compile(schema);

const router = express.Router();
router.use(bodyParser.json());

let authRouter = (conn) => {
    router.post('/', (req, res) => {
        if (req.query.error) {
            let errorMsg = 'default error';
            let errorCode = 400;
            console.log(errorCode + ' ' + errorMsg);

            res.status(errorCode);
            res.json({ error: errorMsg });
            return;
        }
        let valid = validate(req.body);
        if (!valid) {
            let errorMsg = 'json is not valid';
            let errorCode = 400;
            console.log(errorCode + ' ' + errorMsg);

            res.status(errorCode);
            res.json({ error: errorMsg });
            return;
        }
        conn.createChannel().then((ch) => {
            const apiQueueName = 'api-authentication-queue';
            const serviceQueueName = 'service-authentication-queue';
            // console.log('login: ' + req.body.login + ' password: ' + req.body.password);
            // ch.sendToQueue(apiQueueName, new Buffer('auth_request'));
            // let buffer = new Buffer()

            // let payload = 'login: ' + req.body.login + ' password: ' + req.body.password
            // 'login: ' + req.body.login + ' password: ' + req.body.password
            let payload = {login: req.body.login, password: req.body.password};
            ch.sendToQueue(apiQueueName, new Buffer(JSON.stringify(payload)));

            ch.consume(serviceQueueName, (msg, err) => {
                if (msg !== null) {
                    ch.ack(msg);
                    res.json({ msg: msg.content.toString() });
                }
                ch.close();
            });
        }).catch(err => console.log(err));
});
    return router;
};
export default authRouter;