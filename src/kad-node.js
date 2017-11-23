'use strict';

const kad = require('kad');
const levelup = require('levelup');
const leveldown = require('leveldown');
// const sha1 = require('js-sha1');
const crypto = require('crypto');

const transport = new kad.HTTPTransport();
const identity = kad.utils.getRandomKeyString();

const DB_PATH = `.localdb/.ass-${identity}`;
const storage = levelup(leveldown(DB_PATH));

const { AlreadyExistError } = require('./models/Error');
const { Seed } = require('./models/Seed');
const logger = require('./config/logger')(`first node-[${identity}]`);

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
  let [identityString] = req.contact;
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
              acc => {
                logger.log(`....successfully put new values: ${account.toString('utf8')}`)
              });
            next();
          });
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

const seed = Seed.getBase();
node.join(seed, () => {

  logger.log(`Connected to ${node.router.size} peers!`);

  const hash = crypto.createHash('sha1').update('satoshi').digest('hex');
  const alias_network_address = 'satoshi:ethereum:0x1Fed25AA5311d770F29E22870CDb9e715052FeA7';

  // store new value
  node.iterativeStore(hash, alias_network_address, (err, res) => {
    logger.log('SOME RES: ', res);
    if (err) {
      logger.error(err);
    }
  })

  //check if value exist
  // node.iterativeFindValue(hash.update('satoshi'), (err, res) => {
  //   console.log(err);
  //   console.log(Buffer.from(res.data).toString());
  // });

});
