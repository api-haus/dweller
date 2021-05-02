const kafka = require('../lib/kafka');

/**
 * Consume on selected topics.
 *
 * @param topics
 * @returns {Promise<void>}
 */
module.exports = async (topics) => {
  const consumer = kafka.consumer({ groupId: 'my-group' });

  await consumer.connect();

  for (const topic of topics)
    await consumer.subscribe({ topic });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const request = JSON.parse(message.value);
    },
  });
};
