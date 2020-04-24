describe('EmployeePositionController', () => {
    const EmployeePositionController = require('../../src/controllers/EmployeePositionController');
    const expectedControllerPositionsValue = 'test_value1', expectedFromDate = 'test_fromdate', expectedToDate = 'test_todate';
    var controller, employeePositionServiceMock, resultMock, requestStub;

    beforeEach(() => {
        employeePositionServiceMock = jasmine.createSpyObj('EmployeePositionService', ['getPositions']);
        employeePositionServiceMock.getPositions.and.returnValue(Promise.resolve(expectedControllerPositionsValue));
        resultMock = jasmine.createSpyObj('result', ['send']);
        requestStub = { query: { fromDate: expectedFromDate, toDate: expectedToDate }};

        controller = EmployeePositionController(employeePositionServiceMock);
    });
    
    it('queries service with fromDate and toDate keywords in query string', async () => {
        await controller.get(requestStub, resultMock);

        expect(employeePositionServiceMock.getPositions).toHaveBeenCalledWith(expectedFromDate, expectedToDate);
    });

    it('sends result from getPositions as result to query', async () => {
        await controller.get(requestStub, resultMock);

        expect(resultMock.send).toHaveBeenCalledWith(expectedControllerPositionsValue);
    });
});