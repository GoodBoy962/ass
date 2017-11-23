'use strict';

const kad = require('kad');
const quasar = require('kad-quasar');
const levelup = require('levelup');
const leveldown = require('leveldown');

const transport = new kad.HTTPTransport();
const identity = kad.utils.getRandomKeyString();

const logger = require('./config/logger')(`node-[${identity}]`);

const DB_PATH = `../.ass-${identity}`;
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
  const [identityString] = req.contact;
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

const seed = Seed.getBase();
node.join(seed, () => {
  logger.log(`Connected to ${node.router.size} peers!`);

  node.quasarSubscribe('topic string', (content) => {
    logger.log(content);
  });

  node.quasarPublish('topic string', {
    alias: 'satoshi',
    network: 'ethereum',
    address: '0x1Fed25AA5311d770F29E22870CDb9e715052FeA7'
  });

});
