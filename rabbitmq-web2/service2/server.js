const express = require('express');
const amqp    = require('amqplib');

const RABBIT_URL = process.env.RABBITMQ_URL;
const QUEUE      = process.env.QUEUE_NAME;

async function start() {
  const conn    = await amqp.connect(RABBIT_URL);
  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });

  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static('public'));

  app.post('/send', async (req, res) => {
    const msg = req.body.message;
    if (msg) {
      channel.sendToQueue(QUEUE, Buffer.from(msg), { persistent: true });
    }
    return res.redirect('/');
  });

  app.listen(3000, () => console.log('Publisher on :3000'));
}

start().catch(err => { console.error(err); process.exit(1); });
