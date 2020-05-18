describe('PersonController', () => {
    const PersonController = require('../../src/controllers/PersonController');
    const expectedControllerPersonsValue = 'test_value1', expectedFromDate = 'test_fromdate', expectedToDate = 'test_todate';
    var controller, personServiceMock, resultMock, requestStub;

    beforeEach(() => {
        personServiceMock = jasmine.createSpyObj('PersonService', ['get']);
        personServiceMock.get.and.returnValue(Promise.resolve(expectedControllerPersonsValue));
        resultMock = jasmine.createSpyObj('result', ['send', 'set']);
        requestStub = { query: { fromDate: expectedFromDate, toDate: expectedToDate }};

        controller = PersonController(personServiceMock);
    });
    
    it('queries service with fromDate and toDate keywords in query string', async () => {
        await controller.get(requestStub, resultMock);

        expect(personServiceMock.get).toHaveBeenCalledWith(expectedFromDate, expectedToDate);
    });

    it('sends result from get as result to query', async () => {
        await controller.get(requestStub, resultMock);

        expect(resultMock.send).toHaveBeenCalledWith(expectedControllerPersonsValue);
    });

    it('sets application type in header', async () => {
        await controller.get(requestStub, resultMock)

        expect(resultMock.set).toHaveBeenCalledWith('Content-Type', 'application/x-ndjson')
    })    
});