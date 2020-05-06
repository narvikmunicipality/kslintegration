describe('VismaOrganisationSyncWorker', () => {
    const VismaOrganisationSyncWorker = require('../../src/workers/VismaOrganisationSyncWorker')
    var worker, logMock, sqlMock, requests, queryReturns, vismaDataSourceMock

    const NO_MATCHING_EXISTING_UNIT_SQL_RESULT = Promise.resolve({ recordset: [], output: {}, rowsAffected: [0] })
    const ONE_MATCHING_EXISTING_UNIT_SQL_RESULT = Promise.resolve({ recordset: [{ InternalId: 1, Name: 'Enhetsnavn 2' }], output: {}, rowsAffected: [1] })
    const ONE_MATCHING_DIFFERENT_NAME_UNIT_SQL_RESULT = Promise.resolve({ recordset: [{ InternalId: 1, Name: 'eNhEtSnAvN 1' }], output: {}, rowsAffected: [1] })
    const INSERT_ID_2_SQL_RESULT = Promise.resolve({ recordset: [{ InsertId: 2 }], output: {}, rowsAffected: [1,1] })

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
                queryReturns.push(NO_MATCHING_EXISTING_UNIT_SQL_RESULT)
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
                    queryReturns.push(NO_MATCHING_EXISTING_UNIT_SQL_RESULT)
                    queryReturns.push(NO_MATCHING_EXISTING_UNIT_SQL_RESULT)
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
        describe('looks up existing unit and does not add it again', () => {
            beforeEach(() => {
                queryReturns.push(ONE_MATCHING_EXISTING_UNIT_SQL_RESULT)
            })

            it('calls input with correct organisationId parameter', async () => {
                vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                await worker.run()

                expect(requests[0].input).toHaveBeenCalledWith('organisationId', '101-1002')
            })

            it('calls query with correct sql', async () => {
                vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                await worker.run()

                expect(requests[0].query).toHaveBeenCalledWith('SELECT InternalId,Name FROM Organisation WHERE ToDate IS NULL AND NewVersionId IS NULL AND OrganisationId=@OrganisationId')
            })

            it("does not insert new unit with matching name and id's already in database", async () => {
                vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                await worker.run()

                expect(requests[1]).toBeUndefined()
            })
        })

        describe("inserts new unit and updates previous when name has changed for id already in database", () => {
            beforeEach(() => {
                queryReturns.push(ONE_MATCHING_DIFFERENT_NAME_UNIT_SQL_RESULT)
                queryReturns.push(INSERT_ID_2_SQL_RESULT)
            })

            describe('new', () => {
                it('calls input with correct name parameter', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                    await worker.run()

                    expect(requests[1].input).toHaveBeenCalledWith('name', 'Enhetsnavn 2')
                })

                it('calls input with correct organisationId parameter', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                    await worker.run()

                    expect(requests[1].input).toHaveBeenCalledWith('organisationId', '101-1002')
                })

                it('inserts new unit with new name and same id', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                    await worker.run()

                    expect(requests[1].query).toHaveBeenCalledWith('INSERT INTO Organisation (OrganisationId,Name) VALUES (@organisationId,@name);SELECT SCOPE_IDENTITY() AS InsertId')
                })
            })

            describe('update', () => {
                it('calls input with correct name parameter', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                    await worker.run()

                    expect(requests[2].input).toHaveBeenCalledWith('name', 'Enhetsnavn 2')
                })

                it('calls input with correct new internalId parameter', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                    await worker.run()

                    expect(requests[2].input).toHaveBeenCalledWith('newInternalId', '2')
                })

                it('calls input with correct old internalId parameter', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                    await worker.run()

                    expect(requests[2].input).toHaveBeenCalledWith('oldInternalId', '1')
                })

                it('inserts new unit with new name and same id', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                    await worker.run()

                    expect(requests[2].query).toHaveBeenCalledWith('UPDATE Organisation SET ToDate=GETDATE(),NewVersionId=@newInternalId WHERE InternalId=@oldInternalId')
                })
            })
        })
    })
})