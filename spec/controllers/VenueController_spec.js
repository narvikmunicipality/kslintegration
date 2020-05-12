describe('VenueController', () => {
    const VenueController = require('../../src/controllers/VenueController')
    var controller, resultMock, requestStub

    beforeEach(() => {
        resultMock = jasmine.createSpyObj('result', ['send', 'set'])

        controller = VenueController()
    })

    it('sends empty result as result to query', async () => {
        await controller.get(requestStub, resultMock)

        expect(resultMock.send).toHaveBeenCalledWith('')
    })

    it('sets application type in header', async () => {
        await controller.get(requestStub, resultMock)

        expect(resultMock.set).toHaveBeenCalledWith('Content-Type', 'application/x-ndjson')
    })
})