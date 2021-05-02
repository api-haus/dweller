/**
 * Document stores sealed result from applying a scenario at visited resource
 */
class Document {
  #url;
  #parsed;
  #responseBody;

  /**
   * Create Document from JSON string
   *
   * @param {string} json
   * @returns {Document}
   */
  static fromJSON(json) {
    const { url, parsed, responseBody } = JSON.parse(json);

    return new Document(new URL(url), parsed, Buffer.from(responseBody));
  }

  /**
   * Create new document
   *
   * @param {URL} url
   * @param {Object} parsed
   * @param {Buffer} responseBody
   */
  constructor(url, parsed, responseBody) {
    this.#url = url;
    this.#parsed = Object.freeze(parsed);
    this.#responseBody = new Buffer(responseBody);
  }

  toObject() {
    const { url, parsed, responseBody } = this;

    return {
      url, parsed, responseBody
    };
  }

  toJSON() {
    const { url, parsed, responseBody } = this;

    return {
      url: url.toString(),
      parsed,
      responseBody: responseBody.toString(),
    };
  }

  /**
   * Resource URL
   *
   * @returns {URL}
   */
  get url() {
    return this.#url;
  }

  /**
   * Parsed document data
   *
   * @returns {Object}
   */
  get parsed() {
    return this.#parsed;
  }

  /**
   * Response body
   *
   * @returns {Buffer}
   */
  get responseBody() {
    return this.#responseBody;
  }
}

module.exports = Document;
