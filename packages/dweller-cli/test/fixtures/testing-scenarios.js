module.exports = dweller => {
  dweller.scenario('http://test-backend', async (url, body) => {
    return {
      hello: 'world',
    };
  });

  dweller.expander('http://test-backend', async (document) => {
    return [
      'http://test-backend/hello-world'
    ];
  });
};
