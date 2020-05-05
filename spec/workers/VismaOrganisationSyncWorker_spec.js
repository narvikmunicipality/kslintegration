describe('VismaOrganisationSyncWorker', () => {
    const VismaOrganisationSyncWorker = require('../../src/workers/VismaOrganisationSyncWorker')
    var worker, logMock, sqlMock, requests, queryReturns, vismaDataSourceMock

    const NO_MATCHING_UNITS_SQL_RESULT = Promise.resolve({ recordsets: [[[{ Units: 0 }]]], recordset: [{ Units: 0 }], output: {}, rowsAffected: [1] })
    const ONE_MATCHING_UNITS_SQL_RESULT = Promise.resolve({ recordsets: [[[{ Units: 1 }]]], recordset: [{ Units: 1 }], output: {}, rowsAffected: [1] })

    const EMPLOYEE_WITH_SINGLE_POSITION_UNIT_1 = { familyName: 'FamilyName', givenName: 'GivenName', ssn: '01020304050', employeeId: '11', positions: [{ isPrimaryPosition: true, startDate: '2020-02-01', organisationId: '101', unitId: '1001', unitName: 'Enhetsnavn 1', title: 'Konsulent' }] }
    const EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2 = { familyName: 'FamilyName', givenName: 'GivenName', ssn: '01020304050', employeeId: '11', positions: [{ isPrimaryPosition: true, startDate: '2020-02-01', organisationId: '101', unitId: '1002', unitName: 'Enhetsnavn 2', title: 'Konsulent' }] }
    const EMPLOYEE_WITH_TWO_POSITIONS = { familyName: 'FamilyName', givenName: 'GivenName', ssn: '01020304050', employeeId: '11', positions: [{ isPrimaryPosition: true, startDate: '2020-02-01', organisationId: '101', unitId: '1001', unitName: 'Enhetsnavn 1', title: 'Konsulent' }, { isPrimaryPosition: false, startDate: '2020-02-01', organisationId: '102', unitId: '1002', unitName: 'Enhetsnavn 2', title: 'Ingeniør' }] }

    beforeEach(() => {
        requests = []
        queryReturns = []

        logMock = jasmine.createSpyObj('log', ['debug'])
        sqlMock = jasmine.createSpyObj('sqlserver', ['request'])
        sqlMock.request.and.callFake(() => {
            let requestMock = jasmine.createSpyObj('request', ['input', 'query'])
            requestMock.query.and.returnValue(Promise.resolve(queryReturns.shift()))
            requestMock.input.and.returnValue(requestMock)
            requests.push(requestMock)
            return requestMock
        })
        vismaDataSourceMock = jasmine.createSpyObj('vismaDataSource', ['getPersons'])

        worker = new VismaOrganisationSyncWorker(logMock, sqlMock, vismaDataSourceMock)
    })

    it('debug logs when a new instance is created', () => {
        expect(logMock.debug).toHaveBeenCalledWith('VismaOrganisationSyncWorker created.')
    })

    it('has set its name', () => {
        expect(worker.name).toEqual('VismaOrganisationSyncWorker')
    })

    describe('empty database', () => {
        describe('units', () => {
            beforeEach(() => {
                queryReturns.push(NO_MATCHING_UNITS_SQL_RESULT)
            })

            describe('single user with single unit', () => {
                it('calls input with correct parameter for organisation id', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_1]))

                    await worker.run()

                    expect(requests[1].input).toHaveBeenCalledWith('organisationId', '101-1001')
                })

                it('calls input with correct parameter for name', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_1]))

                    await worker.run()

                    expect(requests[1].input).toHaveBeenCalledWith('name', 'Enhetsnavn 1')
                })

                it('inserts found units in database with correct query', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_1]))

                    await worker.run()

                    expect(requests[1].query).toHaveBeenCalledWith('INSERT INTO Organisation (OrganisationId,Name) VALUES (@organisationId,@name)')
                })
            })

            describe('single user with multiple units', () => {
                beforeEach(() => {
                    queryReturns.push(NO_MATCHING_UNITS_SQL_RESULT)
                    queryReturns.push(NO_MATCHING_UNITS_SQL_RESULT)
                })

                it('calls input with correct parameter for organisation id', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_TWO_POSITIONS]))

                    await worker.run()

                    expect(requests[1].input).toHaveBeenCalledWith('organisationId', '101-1001')
                    expect(requests[3].input).toHaveBeenCalledWith('organisationId', '102-1002')
                })

                it('calls input with correct parameter for name', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_TWO_POSITIONS]))

                    await worker.run()

                    expect(requests[1].input).toHaveBeenCalledWith('name', 'Enhetsnavn 1')
                    expect(requests[3].input).toHaveBeenCalledWith('name', 'Enhetsnavn 2')
                })

                it('inserts found units in database with correct query', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_TWO_POSITIONS]))

                    await worker.run()

                    for (let i = 1; i < requests.length; i += 2) {
                        expect(requests[i].query).toHaveBeenCalledWith('INSERT INTO Organisation (OrganisationId,Name) VALUES (@organisationId,@name)')
                    }
                })
            })
        })
    })

    describe('database already contains non-expired unit', () => {
        beforeEach(() => {
            queryReturns.push(ONE_MATCHING_UNITS_SQL_RESULT)
        })

        it('calls input with correct organisationId parameter', async () => {
            vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

            await worker.run()

            expect(requests[0].input).toHaveBeenCalledWith('organisationId', '101-1002')
        })

        it('calls input with correct name parameter', async () => {
            vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

            await worker.run()

            expect(requests[0].input).toHaveBeenCalledWith('name', 'Enhetsnavn 2')
        })

        it('calls query with correct sql', async () => {
            vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

            await worker.run()

            expect(requests[0].query).toHaveBeenCalledWith('SELECT COUNT(InternalId) AS Units FROM Organisation WHERE ToDate IS NULL AND NewVersionId IS NULL AND OrganisationId=@OrganisationId AND Name=@name')
        })

        it("does not insert new unit with matching name and id's already in database", async () => {
            vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

            await worker.run()

            expect(requests[1]).toBeUndefined()
        })
    })
})