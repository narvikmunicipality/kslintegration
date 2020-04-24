describe('PersonController', () => {
    const PersonController = require('../../src/controllers/PersonController');
    const expectedControllerPersonsValue = 'test_value1', expectedFromDate = 'test_fromdate', expectedToDate = 'test_todate';
    var controller, personServiceMock, resultMock, requestStub;

    beforeEach(() => {
        personServiceMock = jasmine.createSpyObj('PersonService', ['getPersons']);
        personServiceMock.getPersons.and.returnValue(Promise.resolve(expectedControllerPersonsValue));
        resultMock = jasmine.createSpyObj('result', ['send']);
        requestStub = { query: { fromDate: expectedFromDate, toDate: expectedToDate }};

        controller = PersonController(personServiceMock);
    });
    
    it('queries service with fromDate and toDate keywords in query string', async () => {
        await controller.get(requestStub, resultMock);

        expect(personServiceMock.getPersons).toHaveBeenCalledWith(expectedFromDate, expectedToDate);
    });

    it('sends result from getPersons as result to query', async () => {
        await controller.get(requestStub, resultMock);

        expect(resultMock.send).toHaveBeenCalledWith(expectedControllerPersonsValue);
    });
});