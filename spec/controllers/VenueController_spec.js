describe('VenueController', () => {
    const VenueController = require('../../src/controllers/VenueController')
    var controller, resultMock, requestStub

    beforeEach(() => {
        resultMock = jasmine.createSpyObj('result', ['send'])

        controller = VenueController()
    })

    it('sends empty result as result to query', async () => {
        await controller.get(requestStub, resultMock)

        expect(resultMock.send).toHaveBeenCalledWith('')
    })
})