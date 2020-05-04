describe('VismaSyncWorker', () => {
    const VismaSyncWorker = require('../../src/workers/VismaSyncWorker')
    var worker, logMock, sqlMock, requestMock, vismaDataSourceMock

    const EMPLOYEE_WITH_SINGLE_POSITION = { familyName: 'FamilyName', givenName: 'GivenName', ssn: '01020304050', employeeId: '11', positions: [{ isPrimaryPosition: true, validFromDate: '2020-02-01', organisationId: '101', unitId: '1001', unitName: 'Enhetsnavn 1', title: 'Konsulent' }] }
    const EMPLOYEE_WITH_TWO_POSITIONS = { familyName: 'FamilyName', givenName: 'GivenName', ssn: '01020304050', employeeId: '11', positions: [{ isPrimaryPosition: true, validFromDate: '2020-02-01', organisationId: '101', unitId: '1001', unitName: 'Enhetsnavn 1', title: 'Konsulent' }, { isPrimaryPosition: false, validFromDate: '2020-02-01', organisationId: '102', unitId: '1002', unitName: 'Enhetsnavn 2', title: 'Ingeniør' }] }

    beforeEach(() => {
        requestMock = jasmine.createSpyObj('request', ['input', 'query'])
        requestMock.query.and.returnValue(Promise.resolve(undefined))
        requestMock.input.and.returnValue(requestMock)
        logMock = jasmine.createSpyObj('log', ['debug'])
        sqlMock = jasmine.createSpyObj('sqlserver', ['request'])
        sqlMock.request.and.returnValue(requestMock)
        vismaDataSourceMock = jasmine.createSpyObj('vismaDataSource', ['getPersons'])

        worker = new VismaSyncWorker(logMock, sqlMock, vismaDataSourceMock)
    })

    it('debug logs when a new instance is created', () => {
        expect(logMock.debug).toHaveBeenCalledWith('VismaSyncWorker created.')
    })

    describe('units', () => {
        describe('single user with single unit', () => {
            it('calls input with correct parameter for organisation id', async () => {
                vismaDataSourceMock.getPersons.and.returnValue([EMPLOYEE_WITH_SINGLE_POSITION])

                await worker.run()

                expect(requestMock.input).toHaveBeenCalledWith('organisationId', '101-1001')
            })

            it('calls input with correct parameter for name', async () => {
                vismaDataSourceMock.getPersons.and.returnValue([EMPLOYEE_WITH_SINGLE_POSITION])

                await worker.run()

                expect(requestMock.input).toHaveBeenCalledWith('name', 'Enhetsnavn 1')
            })

            it('inserts found units in database with correct query', async () => {
                vismaDataSourceMock.getPersons.and.returnValue([EMPLOYEE_WITH_SINGLE_POSITION])

                await worker.run()

                expect(requestMock.query).toHaveBeenCalledWith('INSERT INTO Organisation (OrganisationId,Name) VALUES (@organisationId,@name)')
            })
        })

        describe('single user with multiple units', () => {
            it('calls input with correct parameter for organisation id', async () => {
                vismaDataSourceMock.getPersons.and.returnValue([EMPLOYEE_WITH_TWO_POSITIONS])

                await worker.run()

                expect(requestMock.input).toHaveBeenCalledWith('organisationId', '101-1001')
                expect(requestMock.input).toHaveBeenCalledWith('organisationId', '102-1002')
            })

            it('calls input with correct parameter for name', async () => {
                vismaDataSourceMock.getPersons.and.returnValue([EMPLOYEE_WITH_TWO_POSITIONS])

                await worker.run()

                expect(requestMock.input).toHaveBeenCalledWith('name', 'Enhetsnavn 1')
                expect(requestMock.input).toHaveBeenCalledWith('name', 'Enhetsnavn 2')
            })

            it('inserts found units in database with correct query', async () => {
                vismaDataSourceMock.getPersons.and.returnValue([EMPLOYEE_WITH_TWO_POSITIONS])

                await worker.run()

                let paramcount = 0;
                for (let i = 0; i < requestMock.query.calls.count(); i++) {
                    if (requestMock.query.calls.argsFor(i) == 'INSERT INTO Organisation (OrganisationId,Name) VALUES (@organisationId,@name)') {
                        paramcount++;
                    }
                }
                expect(paramcount).toEqual(2);
            })
        })
    })
})