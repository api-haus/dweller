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

  constructor({ groupId, kafka, inputs, sinks }) {
    super();

    this.#producer = kafka.producer();
    this.#groupId = groupId;
    this.#inputs = inputs;
    this.#sinks = sinks;
    this.#kafka = kafka;
  }

  async connect() {
    await this.#producer.connect();
    const { consumers, inputs, sinks } = this;

    consumers.push(
      this.#consumeEvents(inputs, EVENTS.NEW_REQUEST, this.#parseURL),
      this.#consumeEvents(sinks, EVENTS.NEW_DOCUMENT, this.#parseDocument),
    );
  }

  async disconnect() {
    for (const consumer of this.#consumers)
      await consumer.disconnect();

    await this.#producer.disconnect();
  }

  async publish(document) {
    const { sinks, producer } = this;

    const topicMessages = produceMany(sinks, JSON.stringify(document.toJSON()));

    await producer.sendBatch({ topicMessages });
  }

  async collect(url) {
    const { inputs, producer } = this;

    const topicMessages = produceMany(inputs, url.toString());

    await producer.sendBatch({ topicMessages });
  }

  async #consumeEvents(topics, eventName, handler) {
    const { groupId, kafka } = this;

    const consumer = kafka.consumer({ groupId });

    await consumer.connect();

    for (const topic of topics)
      await consumer.subscribe({ topic });

    consumer.run({
      partitionsConsumedConcurrently: cpus().length,
      eachMessage: async ({ message }) => {
        const intermediate = handler(message.value);

        this.emit(eventName, intermediate);
      },
    })
      .catch(error => this.emit(EVENTS.ERROR, error));

    return consumer;
  }

  #parseURL(message) {
    return new URL(message.value.toString());
  }

  #parseDocument(message) {
    return Document.fromJSON(message.value);
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
