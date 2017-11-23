'use strict';

const kad = require('kad');
const levelup = require('levelup');
const leveldown = require('leveldown');

const transport = new kad.HTTPTransport();
const identity = 'd37db5836b773a39323d7b75b057477674717b66';

const DB_PATH = `.localdb/.ass-${identity}`;
const storage = levelup(leveldown(DB_PATH));

const { AlreadyExistError } = require('./models/Error');
const logger = require('./config/logger')('base-node');

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

node.use((req, res, next) => {
  let [identity] = req.contact;
  logger.log(`MESSAGE from: ${identity}`);
  next();
});

node.use('STORE', (req, res, next) => {
  let [key, val] = req.params;
  const [alias, network, address] = val.value.split(':');

  logger.log(`Incoming: alias ${alias} for network: ${network} with address: ${address}`);

  //create new
  storage.get(key)
    .then(
      () => next(new AlreadyExistError()),
      err => {
        let account = {};
        account[network] = address;
        storage.put(key, JSON.stringify(account))
          .then(() => {
            storage.get(key).then(
              account => {
                logger.log(`....successfully put new values: ${account.toString('utf8')}`)
              });
            next();
          })
      }
    );
});

node.use('ECHO', (req, res, next) => {
  logger.log('***ECHO message...***');
  res.send(req.params);
});

node.use((err, req, res, next) => {
  logger.warn(err);
  res.send({ error: err.message });
});

node.listen(PORT);

logger.log(`Node with identity: ${identity}`);