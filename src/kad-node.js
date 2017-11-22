'use strict';

const kad = require('kad');
const levelup = require('levelup');
const leveldown = require('leveldown');
const sha1 = require('js-sha1');

const transport = new kad.HTTPTransport();
const identity = kad.utils.getRandomKeyString();

const DB_PATH = `.localdb/.ass-${identity}`;
const storage = levelup(leveldown(DB_PATH));

const {
  AlreadyExistError
} = require('./models/Error');

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

const seed = [
  'd37db5836b773a39323d7b75b057477674717b66',
  { hostname: '10.129.57.195', port: 8080 }
];

console.log(`Node with identity: ${identity}`);

node.use((request, response, next) => {
  let [identityString] = request.contact;
  console.log('MESSAGE from: ', identityString);
  next();
});

node.use('STORE', (request, response, next) => {

  console.log('***STORE message...***');

  let [key, val] = request.params;

  console.log(key);

  const [alias, network, address] = val.value.split(':');

  console.log(`Incoming: alias ${alias} for network: ${network} with address: ${address}`);

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
                console.log('....successfully put new values: ', acc.toString('utf8'))
              });
            next();
          });
      }
    );
});

node.use('ECHO', (request, response, next) => {
  console.log('***ECHO message...***');
  response.send(request.params);
});

node.use((err, request, response, next) => {
  console.log(err);
  response.send({ error: err.message });
});

node.listen(PORT);

node.join(seed, () => {
  console.log(`Connected to ${node.router.size} peers!`);

  // store new value
  node.iterativeStore(sha1('satoshi'), 'satoshi:ethereum:0x1Fed25AA5311d770F29E22870CDb9e715052FeA7', (err, res) => {
    console.log('SOME RES: ', res);
    if (err) {
      console.log('ERROR', err);
    }
  })

  //check if value exist
  // node.iterativeFindValue(sha1('satoshi'), (err, res) => {
  //   console.log(err);
  //   console.log(Buffer.from(res.data).toString());
  // });

});
