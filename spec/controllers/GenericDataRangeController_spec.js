describe('GenericDataRangeController', () => {
    const GenericDataRangeController = require('../../src/controllers/GenericDataRangeController')
    const expectedControllerValue = 'test_value1', expectedFromDate = 'test_fromdate', expectedToDate = 'test_todate'
    var controller, dataRangeServiceMock, resultMock, requestStub, dateValidatorMock

    beforeEach(() => {
        dataRangeServiceMock = jasmine.createSpyObj('DataRangeService', ['get'])
        dataRangeServiceMock.get.and.returnValue(Promise.resolve(expectedControllerValue))
        dateValidatorMock = jasmine.createSpyObj('DateValidator', ['isValid'])
        resultMock = jasmine.createSpyObj('result', ['send', 'set', 'status'])
        requestStub = { query: { fromDate: expectedFromDate, toDate: expectedToDate }}

        controller = GenericDataRangeController(dataRangeServiceMock, dateValidatorMock)
    })
    
    it('queries service with fromDate and toDate keywords in query string', async () => {
        dateValidatorMock.isValid.and.returnValue(true)
        
        await controller.get(requestStub, resultMock)

        expect(dataRangeServiceMock.get).toHaveBeenCalledWith(expectedFromDate, expectedToDate)
    })

    it('sends result from get as result to query', async () => {
        dateValidatorMock.isValid.and.returnValue(true)

        await controller.get(requestStub, resultMock)

        expect(resultMock.send).toHaveBeenCalledWith(expectedControllerValue)
    })

    it('sets application type in header', async () => {
        dateValidatorMock.isValid.and.returnValue(true)

        await controller.get(requestStub, resultMock)

        expect(resultMock.set).toHaveBeenCalledWith('Content-Type', 'application/x-ndjson')
    }) 

    it('sets status to 400 when date validation fails', async () => {
        dateValidatorMock.isValid.and.returnValue(false)

        await controller.get(requestStub, resultMock)

        expect(resultMock.status).toHaveBeenCalledWith(400)
    })

    it('does not set status when date validation is ok', async () => {
        dateValidatorMock.isValid.and.returnValue(true)

        await controller.get(requestStub, resultMock)

        expect(resultMock.status).not.toHaveBeenCalled()
    })    

    it('calls date validation with correct parameters', async () => {
        await controller.get(requestStub, resultMock)

        expect(dateValidatorMock.isValid).toHaveBeenCalledWith(expectedFromDate, expectedToDate)
    })

    it('does not send data when date validation fails', async () => {
        dateValidatorMock.isValid.and.returnValue(false)

        await controller.get(requestStub, resultMock)

        expect(resultMock.send).toHaveBeenCalledWith()
    })

    it('does not set content type when date validation fails', async () => {
        dateValidatorMock.isValid.and.returnValue(false)

        await controller.get(requestStub, resultMock)

        expect(resultMock.set).not.toHaveBeenCalled()
    })    
})