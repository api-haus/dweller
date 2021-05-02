dweller
=======

Distributed scraper written in Node.js.

# Usage

## Adding scenarios to scrape public data

```js
const { Kafka } = require('kafkajs');
const { Dweller } = require('dweller');
const { KafkaHub } = require('dweller-kafka');

// Create a dweller running in kafka with default transport using `got` module
const dweller = new Dweller({
  hub: new KafkaHub({
    kafka: new Kafka({ /*...*/ }),
    // Define kafka topics for sinks and inputs
    sinks: ['dweller-parsed-documents'],
    inputs: ['dweller-resource-requests'],
  })
});

// Register scenario for visiting resources by prefix
dweller.scenario('https://incredible-data.com', async (url, response) => {
  const { body } = response;

  /* Parse body */

  // Return parsed data
  return {
    plotSummary,
    relatedPlots
  }
});

// Infer list of additional resources to be visited
dweller.expander('https://incredible-data.com', async (document) => {
  const { relatedPlots } = document.parsed;

  return [
    'https://incredible-data.com/plots/plot-with-a-twist',
    'https://incredible-data.com/plots/kafkaesque',
  ]
});

// Display every parsed document
dweller.on(Dweller.EVENTS.NEW_DOCUMENT, document => {
  console.log(`Parsed new document from ${document.url}: ${JSON.stringify(document.parsed)}`)
});

// Connect to network
await dweller.connect();

// Add a resource in queue
await dweller.visit('https://incredible-data.com/plots/evil-plot');
```
