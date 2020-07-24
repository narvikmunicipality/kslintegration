async function Container() {
    let Bottle = require('bottlejs')
    let axios = require('axios')

    let config = require('./config')

    let indexRoutes = require('./routes/index')

    // Setup logging
    let log4js = require('log4js')
    log4js.configure({
        appenders: { 'out': { type: 'stdout' } },
        categories: { default: { appenders: ['out'], level: 'trace' } }
    })
    var log = log4js.getLogger('bottlejs')
    
    // Setup database connection pool.
    log.debug(`Connecting to database "${config.database.config.database}" as "${config.database.config.user}" on "${config.database.config.server}" ...`)
    if (config.database.config.password === undefined) {
        log.warn(`Password for database user "${config.database.config.user}" is "${config.database.config.password}"`)
    }
    let mssql = require('mssql')
    let sqlPool = await mssql.connect(config.database.config)
    log.debug('Connection to database established.')
    
    // Import types.
    let AuthorityController = require('./controllers/AuthorityController')
    let EmployeePositionController = require('./controllers/GenericDataRangeController')
    let EmployeeTaxonomyController = require('./controllers/EmployeeTaxonomyController')
    let OrganisationController = require('./controllers/GenericDataRangeController')
    let PersonController = require('./controllers/GenericDataRangeController')
    let VenueController = require('./controllers/VenueController')  
    let VismaXmlOrganisationXmlConverter = require('./helper/VismaOrganisationXmlConverter')
    let VismaOrganisationToPersonListConverter = require('./helper/VismaOrganisationToPersonListConverter')    
    let VismaOrganisationPersonCleaner = require('./helper/VismaOrganisationPersonCleaner')    
    let VismaXmlDataSource = require('./helper/VismaXmlDataSource')
    let VismaXmlWsSource = require('./helper/VismaWsXmlRetriever')
    let VismaDatabaseSpecification = require('./helper/VismaDatabaseSpecification')
    let VismaDataExtractor = require('./helper/VismaDataExtractor')
    let VismaDatabaseSyncWorker = require('./workers/VismaDatabaseSyncWorker')
    let ActiveDirectoryService = require('./services/ActiveDirectoryService')
    let DataRangeRetriever = require('./helper/DataRangeRetriever')
    let DatabaseServiceMap = require('./helper/DatabaseServiceMap')
    let DateValidator = require('./helper/DateValidator')

    const bottle = new Bottle()

    // Constants
    bottle.constant('log', log4js)
    bottle.constant('logger', log4js.getLogger)
    bottle.constant('config', config)
    bottle.constant('express', require('express'))
    bottle.constant('rawhttpclient', axios.create({ 'maxContentLength': Infinity, 'maxBodyLength': Infinity }))
    bottle.constant('xml', xml => require('xml-js').xml2js(xml, { compact: true }))
    
    bottle.constant('sqlserver', sqlPool)
    bottle.constant('ldap', require('ldapjs-no-python'))
    bottle.constant('basicauth', require('express-basic-auth'))

    // Miscellaneous
    const ssn2mailList = await (new ActiveDirectoryService(bottle.container.ldap, bottle.container.config.ldap.config)).search('(&(ssn=*)(mail=*))', ['ssn', 'mail'])

    bottle.factory('orgXmlConvert', c => xml => VismaXmlOrganisationXmlConverter(c.xml, xml))
    bottle.factory('orgPersonsConvert', () => organisationData => VismaOrganisationToPersonListConverter(organisationData))
    bottle.factory('orgPersonClean', c => persons => VismaOrganisationPersonCleaner(persons, c.vismaorganisations))
    bottle.factory('indexRoutes', c => indexRoutes(c))
    bottle.factory('ssn2mail', () => ssn2mailList)
    
    // Workers
    bottle.factory('vismaorganisationextractor', c => new VismaDataExtractor().Organisation(c.vismaorganisations))
    bottle.factory('vismapersonextractor', c => new VismaDataExtractor().Person(c.ssn2mail))
    bottle.factory('vismaemployeepositionextractor', c => new VismaDataExtractor().EmployeePosition(c.vismaorganisations))
    
    bottle.factory('vismaorganisationdbspec', () => new VismaDatabaseSpecification().Organisation)
    bottle.factory('vismapersondbspec', () => new VismaDatabaseSpecification().Person)
    bottle.factory('vismaemployeepositiondbspec', () => new VismaDatabaseSpecification().EmployeePosition)
    
    bottle.factory('organisationdatabaseservicemap', () => new DatabaseServiceMap().Organisation)
    bottle.factory('employeepositiondatabaseservicemap', () => new DatabaseServiceMap().EmployeePosition)
    bottle.factory('persondatabaseservicemap', () => new DatabaseServiceMap().Person)
    
    bottle.factory('vismapersonxmlwsreader', c => new VismaXmlWsSource(c.rawhttpclient, c.config.visma_person_ws_url, c.config.visma_ws).download())
    bottle.factory('vismaorganisations', c => c.orgXmlConvert(new VismaXmlWsSource(c.rawhttpclient, c.config.visma_organisation_ws_url, c.config.visma_ws).download()))
    bottle.factory('vismaxmldatasource', c => c.orgPersonClean(new VismaXmlDataSource(c.logger('VismaXmlDataSource'), c.vismapersonxmlwsreader, c.xml)))
    bottle.factory('vismaorganisationworker', c => new VismaDatabaseSyncWorker(c.logger('VismaOrganisationSyncWorker'), c.sqlserver, c.orgPersonsConvert(c.vismaorganisations), c.vismaorganisationdbspec, c.vismaorganisationextractor))
    bottle.factory('vismapersonworker', c => new VismaDatabaseSyncWorker(c.logger('VismaPersonSyncWorker'), c.sqlserver, c.vismaxmldatasource, c.vismapersondbspec, c.vismapersonextractor))
    bottle.factory('vismaemployeepositionworker', c => new VismaDatabaseSyncWorker(c.logger('VismaEmployeePositionSyncWorker'), c.sqlserver, c.vismaxmldatasource, c.vismaemployeepositiondbspec, c.vismaemployeepositionextractor))
    bottle.factory('workers', c => [c.vismaorganisationworker, c.vismapersonworker, c.vismaemployeepositionworker])    

    // Retrievers
    bottle.factory('OrganisationService', c => new DataRangeRetriever(c.vismaorganisationdbspec, c.organisationdatabaseservicemap, c.sqlserver))
    bottle.factory('EmployeePositionService', c => new DataRangeRetriever(c.vismaemployeepositiondbspec, c.employeepositiondatabaseservicemap, c.sqlserver))
    bottle.factory('PersonService', c => new DataRangeRetriever(c.vismapersondbspec, c.persondatabaseservicemap, c.sqlserver))

    // Controllers
    bottle.factory('DateValidator', () => new DateValidator())
    bottle.factory('AuthorityController', c => new AuthorityController(c.config))
    bottle.service('EmployeePositionController', EmployeePositionController, 'EmployeePositionService', 'DateValidator')
    bottle.service('EmployeeTaxonomyController', EmployeeTaxonomyController)
    bottle.service('OrganisationController', OrganisationController, 'OrganisationService', 'DateValidator')
    bottle.service('PersonController', PersonController, 'PersonService', 'DateValidator')
    bottle.service('VenueController', VenueController)

    return bottle.container
}

module.exports = Container()