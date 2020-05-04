(async () => {
    var c = await require('./container'); // Dependency injection container
   
    var log = c.logger("worker");
    log.debug('Starting main worker ...');
    
    for (let i = 0; i < c.workers.length; i++) {
        const worker = c.workers[i];
        const workerLog = c.logger(worker.name)

        workerLog.info('Starting')
        await worker.run()
        workerLog.info('Done')
    }

    log.debug('Main worker finished.')
})();