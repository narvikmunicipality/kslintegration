describe('AuthorityController', () => {
    const AuthorityController = require('../../src/controllers/AuthorityController')
    const EXPECTED_RETURN_VALUE = { name: "Configured kommune", version: "3.0", email: "kommune@example.com" }
    var controller, configStub, resultMock

    beforeEach(() => {
        configStub = { authority: { name: 'Configured kommune', email: 'kommune@example.com' } }
        resultMock = jasmine.createSpyObj('result', ['send'])

        controller = AuthorityController(configStub)
    })

    it('creates correct json from config as result to query', async () => {
        await controller.get(undefined, resultMock)

        expect(resultMock.send).toHaveBeenCalledWith(EXPECTED_RETURN_VALUE)
    })
})