'use strict';

const kad = require('kad');
const levelup = require('levelup');
const leveldown = require('leveldown');
const quasar = require('kad-quasar');

const transport = new kad.HTTPTransport();
const identity = 'd37db5836b773a39323d7b75b057477674717b66';

const logger = require('./config/logger')(`node-[${identity}]`);

const DB_PATH = `../.ass-db-q-${identity}`;
const storage = levelup(leveldown(DB_PATH));

const PORT = process.argv[2];

const contact = {
  hostname: 'localhost',
  port: PORT
};

const node = kad({
  transport: transport,
  storage: storage,
  contact: contact,
  identity: identity
});

node.plugin(quasar);

node.use((req, res, next) => {
  let [identityString] = req.contact;
  logger.log('MESSAGE from: ', identityString);
  next();
});

node.use('STORE', (req, res, next) => {
  logger.log('***STORE message...***');
});

node.use('ECHO', (req, res, next) => {
  logger.log('***ECHO message...***');
});

node.listen(PORT);