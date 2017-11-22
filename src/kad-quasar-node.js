'use strict';

const kad = require('kad');
const quasar = require('kad-quasar');
const levelup = require('levelup');
const leveldown = require('leveldown');

const transport = new kad.HTTPTransport();
const identity = kad.utils.getRandomKeyString();

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

//kad-base node properties
const seed = [
  'd37db5836b773a39323d7b75b057477674717b66',
  { hostname: '10.129.57.195', port: 8080 }
];

console.log(`Node with identity: ${identity}`);

// Use rule "extensions" from other packages to add additional functionality
// using plugins. Plugins can also extend the `Node` object with additional
// methods
node.plugin(quasar);

node.use((request, response, next) => {
  let [identityString] = request.contact;
  console.log('MESSAGE from: ', identityString);
  next();
});

node.use('STORE', (request, response, next) => {
  console.log('***STORE message...***');
});

node.use('ECHO', (request, response, next) => {
  console.log('***ECHO message...***');
});

node.listen(PORT);

node.join(seed, () => {
  console.log(`Connected to ${node.router.size} peers!`);

  node.quasarSubscribe('topic string', (content) => {
    //check if value already exists, otherwise store it
    console.log(content);
  });

  node.quasarPublish('topic string', {
    alias: 'satoshi',
    network: 'ethereum',
    address: '0x1Fed25AA5311d770F29E22870CDb9e715052FeA7'
  });

});
