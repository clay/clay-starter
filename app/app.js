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
  const numCPUs = require('os').cpus().length,
    failedWorkers = [],
    availableWorkers = [];

  let readyWorkers = 0;

  log('info', `Creating ${numCPUs} worker(s)`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', worker => {
    log('warn', `worker ${worker.process.pid} died`);
  });

  // Only available for Node +v6.0
  cluster.on('message', (worker, payload) => {
    console.log('Master recieved the message:', payload);

    if (payload.message === 'READY') {
      readyWorkers++;
      availableWorkers.push(worker);
    }

    if (readyWorkers === numCPUs && payload.message !== 'RETRY') {
      worker.send('CONTINUE');
    }

    if (payload.message === 'RETRY') {
      failedWorkers.push(worker.process.pid);

      const allWorkers = availableWorkers.filter(w => !failedWorkers.includes(w.process.pid)),
        nextWorker = allWorkers.pop();

      nextWorker ? nextWorker.send('CONTINUE') : log(new Error('NO WORKERS AVAILABLE'));
    }
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
