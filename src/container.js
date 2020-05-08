async function Container() {
    let Bottle = require('bottlejs');
    let axios = require('axios')

    let config = require('./config');

    let indexRoutes = require('./routes/index');

    // Setup logging
    let log4js = require('log4js');
    log4js.configure({
        appenders: { 'out': { type: 'stdout' } },
        categories: { default: { appenders: ['out'], level: 'trace' } }
    });
    var log = log4js.getLogger('bottlejs');
    
    // Setup database connection pool.
    log.debug(`Connecting to database "${config.database.config.database}" as "${config.database.config.user}" on "${config.database.config.server}" ...`);
    if (config.database.config.password === undefined) {
        log.warn(`Password for database user "${config.database.config.user}" is "${config.database.config.password}"`);
    }
    let mssql = require('mssql');
    let sqlPool = await mssql.connect(config.database.config);
    log.debug('Connection to database established.');
    
    // Import types.
    let AuthorityController = require('./controllers/AuthorityController')
    let EmployeePositionController = require('./controllers/EmployeePositionController')
    let EmployeeTaxonomyController = require('./controllers/EmployeeTaxonomyController')
    let OrganisationController = require('./controllers/OrganisationController')
    let PersonController = require('./controllers/PersonController')
    let VenueController = require('./controllers/VenueController')  
    let VismaXmlDataSource = require('./helper/VismaXmlDataSource')
    let VismaOrganisationSyncWorker = require('./workers/VismaDatabaseSyncWorker')
    let EmployeePositionService = require('./services/EmployeePositionService')
    let OrganisationService = require('./services/OrganisationService')
    let PersonService = require('./services/PersonService')

    const bottle = new Bottle();

    // Constants
    bottle.constant('log', log4js);
    bottle.constant('logger', log4js.getLogger);
    bottle.constant('config', config);
    bottle.constant('express', require('express'));
    bottle.constant('rawhttpclient', axios.create({ 'maxContentLength': Infinity, 'maxBodyLength': Infinity }))
    bottle.constant('xml', xml => require('xml-js').xml2js(xml, { compact: true }))
    bottle.constant('readfile', require('util').promisify(require('fs').readFile))
    
    bottle.constant('sqlserver', sqlPool);
    bottle.constant('ldap', require('ldapjs-no-python'));
    bottle.constant('basicauth', require('express-basic-auth'))

    // Miscellaneous
    bottle.factory('indexRoutes', c => indexRoutes(c));

    // Workers
    bottle.factory('vismaxmldatasource', c => new VismaXmlDataSource(c.config.visma.xmlpath, c.readfile, c.xml))
    bottle.factory('vismaorganisationsyncworker', c => new VismaOrganisationSyncWorker(c.logger('VismaOrganisationSyncWorker'), c.sqlserver, c.vismaxmldatasource))
    bottle.factory('workers', c => [c.vismaorganisationsyncworker])

    // Services
    bottle.factory('EmployeePositionService', c => new EmployeePositionService(c.logger('EmployeePositionService')));
    bottle.factory('OrganisationService', c => new OrganisationService(c.logger('OrganisationService')));
    bottle.factory('PersonService', c => new PersonService(c.logger('PersonService')));

    // Controllers
    bottle.factory('AuthorityController', c => new AuthorityController(c.config));
    bottle.service('EmployeePositionController', EmployeePositionController, 'EmployeePositionService');
    bottle.service('EmployeeTaxonomyController', EmployeeTaxonomyController);
    bottle.service('OrganisationController', OrganisationController, 'OrganisationService');
    bottle.service('PersonController', PersonController, 'PersonService');
    bottle.service('VenueController', VenueController);

    return bottle.container;
}

module.exports = Container();