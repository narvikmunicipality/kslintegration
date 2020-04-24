describe('OrganisationController', () => {
    const OrganisationController = require('../../src/controllers/OrganisationController');
    const expectedControllerOrganisationsValue = 'test_value1', expectedFromDate = 'test_fromdate', expectedToDate = 'test_todate';
    var controller, organisationServiceMock, resultMock, requestStub;

    beforeEach(() => {
        organisationServiceMock = jasmine.createSpyObj('OrganisationService', ['getOrganisations']);
        organisationServiceMock.getOrganisations.and.returnValue(Promise.resolve(expectedControllerOrganisationsValue));
        resultMock = jasmine.createSpyObj('result', ['send']);
        requestStub = { query: { fromDate: expectedFromDate, toDate: expectedToDate }};

        controller = OrganisationController(organisationServiceMock);
    });
    
    it('queries service with fromDate and toDate keywords in query string', async () => {
        await controller.get(requestStub, resultMock);

        expect(organisationServiceMock.getOrganisations).toHaveBeenCalledWith(expectedFromDate, expectedToDate);
    });

    it('sends result from getOrganisations as result to query', async () => {
        await controller.get(requestStub, resultMock);

        expect(resultMock.send).toHaveBeenCalledWith(expectedControllerOrganisationsValue);
    });
});