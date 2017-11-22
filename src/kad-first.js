'use strict';

const kad = require('kad');
const levelup = require('levelup');
const leveldown = require('leveldown');

const transport = new kad.HTTPTransport();
const identity = kad.utils.getRandomKeyString();

const DB_PATH = `.localdb/.ass-${identity}`;
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
  {hostname: '10.129.57.195', port: 8080}
];

console.log(`Node with identity: ${identity}`);

node.listen(PORT);

node.join(seed, () => {
  console.log(`Connected to ${node.router.size} peers!`);
});
