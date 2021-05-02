const EventEmitter = require('events');

const EventHub = require('./event-hub');
const Document = require('./document');
const GotTransport = require('./got-transport');
const PrefixMapper = require('./lib/prefix-mapper');

const EVENTS = Object.freeze({
  ...EventHub.EVENTS,
  ERROR: 'error',
});

/**
 * Dweller provides an interface for establishing crawling scenarios
 */
class Dweller extends EventEmitter {
  static EVENTS = EVENTS;

  #hub;
  #transport;
  #scenarios = new PrefixMapper();
  #expanders = new PrefixMapper();

  /**
   * Creates new Dweller
   *
   * @param {{hub:EventHub,transport:GotTransport}} params
   */
  constructor(params = {}) {
    super();

    const {
      hub = new EventHub(),
      transport = new GotTransport(),
    } = params;

    this.#transport = transport;
    this.#hub = hub;
    this.#bind();
  }

  /**
   * Connect dweller to the network if needed
   *
   * @returns {Promise<*>}
   */
  async connect() {
    if (this.#hub.connect)
      return this.#hub.connect();
  }

  /**
   * Register a scenario
   *
   * @param {string} prefix URL prefix
   * @param {Function} handler scenario handler
   */
  scenario(prefix, handler) {
    this.#scenarios.register(prefix, handler);
  }

  /**
   * Register an expander
   *
   * @param {string} prefix URL prefix
   * @param {Function} handler expander handler
   */
  expander(prefix, handler) {
    this.#expanders.register(prefix, handler);
  }

  /**
   * Add URL for collection
   *
   * @param {string|URL} url
   */
  async visit(url) {
    return this.#hub.collect(url);
  }

  #bind() {
    this.#hub.on(EventHub.EVENTS.NEW_REQUEST, url => {
      this.emit(EVENTS.NEW_REQUEST, url);
      this.#handleRequest(url)
        .catch(error => this.emit(EVENTS.ERROR, error));
    });
    this.#hub.on(EventHub.EVENTS.NEW_DOCUMENT, document => {
      this.emit(EVENTS.NEW_DOCUMENT, document);
      this.#expandOnNewDocument(document)
        .catch(error => this.emit(EVENTS.ERROR, error));
    });
    this.#hub.on(EventHub.EVENTS.ERROR, error => {
      this.emit(EVENTS.ERROR, error);
    });
  }

  async #handleRequest(url) {
    const scenario = this.#scenarios.resolve(url);

    if (!scenario)
      throw new Error(`scenario for ${url} is undefined`);

    const response = await this.#transport.fetch(url);
    const parsed = await scenario(url, response);

    return this.#hub.publish(new Document(url, parsed, response));
  }

  async #expandOnNewDocument(document) {
    const expander = this.#expanders.resolve(document.url);

    if (!expander)
      return;

    const resources = await expander(document);

    for (const resource of resources)
      await this.#hub.collect(resource);
  }
}

module.exports = Dweller;
