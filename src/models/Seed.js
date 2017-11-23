'use strict';

class Seed {

  constructor(identity, hostname, port) {
    Object.assign(this, { identity, hostname, port });
  }

  toJSON() {
    const { identity, hostname, port } = this;
    return { identity, hostname, port };
  }

  static getBase() {
    return [
      'd37db5836b773a39323d7b75b057477674717b66',
      {
        hostname: '127.0.0.1',
        port: 8080
      }];
  }
}

Object.assign(exports, { Seed });