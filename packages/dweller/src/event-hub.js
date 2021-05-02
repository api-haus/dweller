const { EventEmitter } = require('events');

const EVENTS = Object.freeze({
  NEW_DOCUMENT: 'document-is-collected',
  NEW_REQUEST: 'requesting-to-collect',
  ERROR: 'error',
});

class EventHub extends EventEmitter {
  static EVENTS = EVENTS;

  publish(document) {
    this.emit(EVENTS.NEW_DOCUMENT, document);
  }

  collect(url) {
    if (typeof url === 'string')
      url = new URL(url);

    this.emit(EVENTS.NEW_REQUEST, url);
  }
}

module.exports = EventHub;
