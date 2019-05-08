'use strict';

const pkg = require('./package.json'),
  express = require('express'),
  cluster = require('cluster'),
  logger = require('./services/universal/log'),
  startup = require('./services/startup'),
  port = process.env.PORT || 3001,
  ip = process.env.IP_ADDRESS || '0.0.0.0';

logger.init(pkg.version);
let log = logger.setup({ file: __filename }),
  app;

if (cluster.isMaster) {
  const numCPUs = require('os').cpus().length;

  log('info', `Creating ${numCPUs} worker(s)`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', worker => {
    log('warn', `worker ${worker.process.pid} died`);
  });

  log('info', 'Master process is running');
} else {
  app = express();
  startup(app)
    .then(router => {
      router.listen(port, ip);
      log('info', `Clay listening on ${ip}:${port} (process ${process.pid})`);
    })
    .catch(error => {
      log('error', error.message, { stack: error.stack });
    });
}
