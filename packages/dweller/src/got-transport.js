const got = require('got');

class GotTransport {
  #client = got.extend({ resolveBodyOnly: true })

  fetch(url) {
    return this.#client.get(url);
  }
}

module.exports = GotTransport;
