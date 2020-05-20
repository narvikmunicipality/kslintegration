describe('routes-index', () => {
    var routes, containerMock, routerMock;

    beforeEach(() => {
        routerMock = jasmine.createSpyObj('Router', ['get']);
    
        containerMock = jasmine.createSpy('container');
        containerMock.AuthorityController = jasmine.createSpyObj('AuthorityController', ['get']);
        containerMock.EmployeePositionController = jasmine.createSpyObj('EmployeePositionController', ['get']);
        containerMock.EmployeeTaxonomyController = jasmine.createSpyObj('EmployeeTaxonomyController', ['get']);
        containerMock.OrganisationController = jasmine.createSpyObj('OrganisationController', ['get']);
        containerMock.PersonController = jasmine.createSpyObj('PersonController', ['get']);
        containerMock.VenueController = jasmine.createSpyObj('VenueController', ['get']);
        containerMock.express = jasmine.createSpy('express');
        containerMock.express.Router = () => { return routerMock; };

        routes = require('../../src/routes/index');
    });

    it('returns router from container', () => {
        var result = routes(containerMock);
        
        expect(result).toBe(routerMock);
    });

    describe('maps', () => {
        it('/ksl/v3/authority to AuthorityController', () => {
            routes(containerMock);

            expect(routerMock.get).toHaveBeenCalledWith('/ksl/v3/authority', containerMock.AuthorityController.get);
        });

        it('/ksl/v3/employee_position to EmployeePositionController', () => {
            routes(containerMock);

            expect(routerMock.get).toHaveBeenCalledWith('/ksl/v3/employee_position', containerMock.EmployeePositionController.get);
        });

        it('/ksl/v3/employee_taxanomy to EmployeeTaxonomyController', () => {
            routes(containerMock);

            expect(routerMock.get).toHaveBeenCalledWith('/ksl/v3/employee_taxonomy', containerMock.EmployeeTaxonomyController.get);
        });
        
        it('/ksl/v3/organisation to OrganisationController', () => {
            routes(containerMock);

            expect(routerMock.get).toHaveBeenCalledWith('/ksl/v3/organisation', containerMock.OrganisationController.get);
        });

        it('/ksl/v3/person to PersonController', () => {
            routes(containerMock);

            expect(routerMock.get).toHaveBeenCalledWith('/ksl/v3/person', containerMock.PersonController.get);
        });

        it('/ksl/v3/venue to VenueController', () => {
            routes(containerMock);

            expect(routerMock.get).toHaveBeenCalledWith('/ksl/v3/venue', containerMock.VenueController.get);
        });
    });
});