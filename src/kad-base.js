'use strict';

const kad = require('kad');
const levelup = require('levelup');
const leveldown = require('leveldown');

const transport = new kad.HTTPTransport();
const identity = 'd37db5836b773a39323d7b75b057477674717b66';

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

node.use((request, response, next) => {
  let [identityString] = request.contact;
  console.log('MESSAGE from: ', identityString);
  next();
});

node.use('STORE', (request, response, next) => {

  console.log('***STORE message...***');

  let [key, val] = request.params;

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
              account => {
                console.log('....successfully put new values: ', account.toString('utf8'))
              });
            next();
          })
      }
    );
});

node.use('ECHO', (request, response, next) => {
  console.log('***ECHO message...***');
  if ([/* some naughty words */].includes(request.params.message)) {
    return next(new Error(
      `Oh goodness, I dare not say "${request.params.message}"`
    ));
  }

  console.log('***END***');

  response.send(request.params);
});

node.use((err, request, response, next) => {
  console.log(err);
  response.send({ error: err.message });
});

node.listen(PORT);

console.log(`Node with identity: ${identity}`);