const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const amqp = require('amqplib');

const RABBIT_URL = process.env.RABBITMQ_URL;
const QUEUE      = process.env.QUEUE_NAME;

async function start() {
  const app    = express();
  const server = http.createServer(app);
  const io     = new Server(server);

  app.use(express.static('public'));
  server.listen(3000, () => console.log('Listener on :3000'));

  const conn    = await amqp.connect(RABBIT_URL);
  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });
  channel.consume(QUEUE, msg => {
    if (!msg) return;
    io.emit('new_message', msg.content.toString());
    channel.ack(msg);
  });
}

start().catch(err => { console.error(err); process.exit(1); });
