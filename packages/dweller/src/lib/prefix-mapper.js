class PrefixMapper {
  #map = new Map();

  static register(mapper) {
    return mapper.register.bind(mapper);
  }

  /**
   * Register handler by origin
   *
   * @param {string} origin
   * @param {Function} handler
   */
  register(origin, handler) {
    // Remove trailing slash
    this.#map.set(origin.replace(/\/$/, ''), handler);
  }

  /**
   * Resolve a handler by passing resource location
   *
   * @param {URL} url resource location
   * @returns {Function} resolved handler
   */
  resolve(url) {
    return this.#map.get(url.origin);
  }
}

module.exports = PrefixMapper;
