async function Container() {
    let Bottle = require('bottlejs');
    let axios = require('axios')

    let config = require('./config');

    let indexRoutes = require('./routes/index');

    // Setup logging
    let log4js = require('log4js');
    log4js.configure({
        appenders: { 'out': { type: 'stdout' } },
        categories: { default: { appenders: ['out'], level: 'debug' } }
    });
    
    // Import types.
    let AuthorityController = require('./controllers/AuthorityController')
    let EmployeePositionController = require('./controllers/EmployeePositionController')
    let EmployeeTaxonomyController = require('./controllers/EmployeeTaxonomyController')
    let OrganisationController = require('./controllers/OrganisationController')
    let PersonController = require('./controllers/PersonController')
    let VenueController = require('./controllers/VenueController')    
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
    bottle.constant('xml', require('xml-js'))
    bottle.constant('ldap', require('ldapjs-no-python'));
    bottle.constant('basicauth', require('express-basic-auth'))

    // Miscellaneous
    bottle.factory('indexRoutes', c => indexRoutes(c));    

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