const { Dweller } = require('dweller');
const { KafkaHub } = require('dweller-kafka');

const kafka = require('../lib/kafka');
const sourceLoader = require('../lib/loader');
const MockTransport = require('dweller/src/mock-transport');

const {
  DWELLER_IMPLEMENTATION_ROOT,
  DWELLER_KAFKA_INPUTS,
  DWELLER_KAFKA_SINKS
} = process.env;

/**
 * Entrypoint for the `collect` command.
 * Consume from input topics and writes results to sinks.
 *
 * @returns {Promise<void>}
 */
module.exports = async () => {
  const sinks = DWELLER_KAFKA_SINKS.split(',');
  const inputs = DWELLER_KAFKA_INPUTS.split(',');
  const loader = await sourceLoader(DWELLER_IMPLEMENTATION_ROOT);

  const dweller = new Dweller({
    hub: new KafkaHub({ kafka, inputs, sinks })
  });

  // Load scenario/expander implementation from external source files
  await loader(dweller);

  return dweller.connect();
};
