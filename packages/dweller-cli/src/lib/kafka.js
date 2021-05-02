const { Kafka } = require('kafkajs');

const { KAFKA_BROKERS } = process.env;

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: KAFKA_BROKERS.split(',')
});

module.exports = kafka;
