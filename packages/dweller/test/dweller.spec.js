const test = require('ava');

const Dweller = require('../src/dweller');
const MockTransport = require('../src/mock-transport');

test('Should fetch and apply a scenario', async t => {
  const expectParsed = { hello: { world: 'foo-bar' } };
  const expectBody = Buffer.from('hello-world');
  const expectUrl = 'https://test-data.com/foo?bar=baz#hello';

  const dweller = new Dweller({
    transport: new MockTransport({
      [expectUrl]: expectBody
    })
  });

  t.plan(3);

  dweller.scenario('https://test-data.com/', async (url, body) => {
    t.deepEqual(url.toString(), expectUrl.toString());
    t.deepEqual(body, expectBody);

    return expectParsed;
  });

  dweller.on(Dweller.EVENTS.ERROR, error => {
    throw error;
  });

  await dweller.visit(expectUrl);

  await new Promise(resolve => {
    dweller.on(Dweller.EVENTS.NEW_DOCUMENT, document => {
      t.deepEqual(document.toJSON(), {
        url: expectUrl,
        parsed: expectParsed,
        responseBody: expectBody.toString(),
      });

      resolve();
    });
  });
});

test('Should fetch and expand', async t => {
  const expandedURLs = [
    'https://test-data.com/expanded?bar=baz#hello',
    'https://test-data.com/expanded?bar=baz#hello',
    'https://test-data.com/expanded?bar=baz#hello',
  ];
  const expandedURL = 'https://test-data.com/expanded?bar=baz#hello';
  const expectParsed = { hello: { world: 'foo-bar' } };
  const expectBody = Buffer.from('hello-world');
  const expectUrl = 'https://test-data.com/original?bar=baz#hello';

  const dweller = new Dweller({
    transport: new MockTransport({
      [expectUrl]: expectBody,
      [expandedURL]: expectBody
    })
  });

  t.plan(1 + expandedURLs.length);
  dweller.scenario('https://test-data.com/', async (url, body) => {
    t.deepEqual(body, expectBody);

    return expectParsed;
  });

  dweller.expander('https://test-data.com/', async (document) => {
    if (document.url.toString() === expectUrl)
      return expandedURLs;

    return [];
  });

  dweller.on(Dweller.EVENTS.ERROR, error => {
    throw error;
  });

  await dweller.visit(expectUrl);

  await new Promise(resolve => {
    let allDocuments = [];

    dweller.on(Dweller.EVENTS.NEW_DOCUMENT, document => {
      allDocuments.push(document);

      if (allDocuments.length >= expandedURLs.length + 1)
        resolve();
    });
  });
});
