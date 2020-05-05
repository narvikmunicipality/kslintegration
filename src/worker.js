(async () => {
    var c = await require('./container'); // Dependency injection container
   
    var log = c.logger("worker");
    log.debug('Starting main worker ...');
    
    for (let i = 0; i < c.workers.length; i++) {
        const worker = c.workers[i];

        log.info(`Starting ${worker.name}`)
        await worker.run()
        log.info(`Finished ${worker.name}`)
    }

    log.debug('Main worker finished.')
})();