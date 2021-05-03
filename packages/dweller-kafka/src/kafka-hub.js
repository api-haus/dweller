const debug = require('debug')('dweller:kafka');
const { cpus } = require('os');
const { Document } = require('dweller');
const { EventEmitter } = require('events');

const EVENTS = Object.freeze({
  NEW_DOCUMENT: 'document-is-collected',
  NEW_REQUEST: 'requesting-to-collect',
  ERROR: 'error',
});

class KafkaHub extends EventEmitter {
  static EVENTS = EVENTS;

  #kafka;
  #sinks;
  #inputs;
  #groupId;
  #producer;
  #consumers;

  constructor({ groupId = 'dweller-kafka', kafka, inputs = [], sinks = [] }) {
    super();

    this.#consumers = [];
    this.#groupId = groupId;
    this.#inputs = inputs;
    this.#sinks = sinks;
    this.#kafka = kafka;
  }

  async connect() {
    const eventConsumers = await Promise.all([
      this.#consumeEvents(this.#inputs, EVENTS.NEW_REQUEST, this.#readURL),
      this.#consumeEvents(this.#sinks, EVENTS.NEW_DOCUMENT, this.#readDocument),
    ]);

    this.#consumers.push(...eventConsumers);
  }

  async disconnect() {
    for (const consumer of this.#consumers)
      await consumer.disconnect();

    if (this.#producer)
      await this.#producer.disconnect();
  }

  async publish(document) {
    const message = JSON.stringify(document.toJSON());
    const topicMessages = produceMany(this.#sinks, message);

    const producer = await this.#getProducer();
    await producer.sendBatch({ topicMessages });
  }

  async collect(url) {
    const message = url.toString();
    const topicMessages = produceMany(this.#inputs, message);

    const producer = await this.#getProducer();
    await producer.sendBatch({ topicMessages });
  }

  async #consumeEvents(topics, eventName, handler) {
    const groupId = `${this.#groupId}-${eventName}`;
    const consumer = this.#kafka.consumer({ groupId });

    await consumer.connect();

    for (const topic of topics)
      await consumer.subscribe({ topic });

    consumer.run({
      partitionsConsumedConcurrently: cpus().length,
      eachMessage: async ({ message }) => {
        debug('Message on %s: %s', topics, message.value.toString());

        const intermediate = handler(message);

        this.emit(eventName, intermediate);
      },
    })
      .catch(error => this.emit(EVENTS.ERROR, error));

    return consumer;
  }

  #readURL(message) {
    return new URL(message.value.toString());
  }

  #readDocument(message) {
    return Document.fromJSON(message.value);
  }

  async #getProducer() {
    if (this.#producer)
      return this.#producer;

    const producer = this.#kafka.producer();

    await producer.connect();
    this.#producer = producer;

    return producer;
  }
}

module.exports = KafkaHub;

function produceMany(topics, message) {
  return topics.map(topic => {
    return {
      topic,
      messages: [{ value: message }]
    };
  });
}
