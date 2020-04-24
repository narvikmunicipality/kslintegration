describe('EmployeeTaxonomyController', () => {
    const EmployeeTaxonomyController = require('../../src/controllers/EmployeeTaxonomyController');
    var controller, resultMock;

    beforeEach(() => {
        resultMock = jasmine.createSpyObj('result', ['send']);

        controller = EmployeeTaxonomyController();
    });

    it('sends empty result as result to query', async () => {
        await controller.get(undefined, resultMock);

        expect(resultMock.send).toHaveBeenCalledWith('');
    });
});