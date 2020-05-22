function index(c) {
    let router = c.express.Router();

    router.get('/v3/authority', c.AuthorityController.get);
    router.get('/v3/employee_position', c.EmployeePositionController.get);
    router.get('/v3/employee_taxonomy', c.EmployeeTaxonomyController.get);
    router.get('/v3/organisation', c.OrganisationController.get);
    router.get('/v3/person', c.PersonController.get);
    router.get('/v3/venue', c.VenueController.get);

    return router;
}

module.exports = index;
