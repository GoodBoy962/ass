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

const { Seed } = require('./models/Seed');
const logger = require('./config/logger')(`first node-[${identity}]`);

node.listen(PORT);

const seed = Seed.getBase();
node.join(seed, () => {
  console.log(`Connected to ${node.router.size} peers!`);
});
