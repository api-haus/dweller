const { Dweller } = require('dweller');
const { KafkaHub } = require('dweller-kafka');

const kafka = require('../lib/kafka');

const {
  DWELLER_KAFKA_INPUTS
} = process.env;

/**
 * Entrypoint for the `collect` command.
 * Consume from input topics and writes results to sinks.
 *
 * @param {string|URL} url
 * @returns {Promise<void>}
 */
module.exports = async (url) => {
  const inputs = DWELLER_KAFKA_INPUTS.split(',');

  const dweller = new Dweller({
    hub: new KafkaHub({ kafka, inputs })
  });

  await dweller.visit(url);
  await dweller.disconnect();
};
