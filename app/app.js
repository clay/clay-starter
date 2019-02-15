'use strict';

var pkg = require('./package.json'),
  express = require('express'),
  logger = require('./services/universal/log'),
  log = logger.init(pkg.version),
  startup = require('./services/startup'),
  port = process.env.PORT || 3001,
  ip = process.env.IP_ADDRESS || '0.0.0.0',
  log = logger.setup({ file: __filename });

startup(express())
  .then(function (router) {
    router.listen(port, ip);
    log('info', 'Clay listening on ' + ip + ':' + port + ' (process ' + process.pid + ')');
  })
  .catch(function (error) {
    log('error', error.message, { stack: error.stack });
  });
