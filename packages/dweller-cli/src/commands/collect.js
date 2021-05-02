const consumer = require('../collector/consumer');

/**
 * Entrypoint for the `collect` command.
 * Consume one or more topics for scraping requests.
 *
 * @returns {Promise<void>}
 */
module.exports = async (...topics) => {
  if (topics.length === 0)
    throw new Error('Must provide a list of topics for `collect` command');

  return consumer(topics);
};
