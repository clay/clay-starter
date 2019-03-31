'use strict';

const pkg = require('./package.json'),
  express = require('express'),
  logger = require('./services/universal/log'),
  startup = require('./services/startup'),
  port = process.env.PORT || 3001,
  ip = process.env.IP_ADDRESS || '0.0.0.0';

logger.init(pkg.version);
let log = logger.setup({ file: __filename });

startup(express())
  .then(router => {
    router.listen(port, ip);
    log('info', `Clay listening on ${ip}:${port} (process ${process.pid})`);
  })
  .catch(error => {
    log('error', error.message, { stack: error.stack });
  });
