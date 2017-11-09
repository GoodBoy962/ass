'use strict';
const path = require('path');
const fs = require('fs');
const levelup = require('levelup');
const leveldown = require('leveldown');

const {
  DATA_DIR = '../.ass',
  NODE_ENV = 'development',
  HOST_URI = 'localhost:8080',
  NODE_PORT = 8080,
  API_KEY = 'key'
} = process.env;

const datadir = path.resolve(DATA_DIR);
!fs.existsSync(datadir) && fs.mkdirSync(datadir);

Object.assign(exports, {
  env: NODE_ENV,
  port: NODE_PORT,
  hostUri: HOST_URI,
  apiKey: API_KEY,
  db: levelup(leveldown(datadir))
});