#!/usr/bin/env node
'use strict';
const pkg = require('../package.json');
const config = require('../src/config');
const app = require('../src/app.js');
const log = require('../src/config/logger')('www');

app.listen(config.port, () =>
  log.debug(`${pkg.name.toUpperCase()} started on port: ${config.port}`)
);

process.on('SIGINT', function() {  
  process.exit(0); 
}); 