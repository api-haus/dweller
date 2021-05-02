class MockTransport {
  #hashmap;

  constructor(hashmap) {
    this.#hashmap = hashmap;
  }

  fetch(url) {
    return this.#hashmap[url.toString()];
  }
}

module.exports = MockTransport;
