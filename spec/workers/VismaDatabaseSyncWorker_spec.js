describe('VismaDatabaseSyncWorker', () => {
    const sqlExpect = require('../test/RequestHelper')
    const VismaDatabaseSyncWorker = require('../../src/workers/VismaDatabaseSyncWorker')
    var worker, logMock, sqlMock, requests, queryReturns, vismaDataSourceMock

    const NO_MATCHING_EXISTING_UNIT_SQL_RESULT = { recordset: [], output: {}, rowsAffected: [0] }
    const ONE_MATCHING_EXISTING_UNIT_SQL_RESULT_E1 = { recordset: [{ InternalId: 2, Name: 'Enhetsnavn 1' }], output: {}, rowsAffected: [1] }
    const ONE_MATCHING_EXISTING_UNIT_SQL_RESULT_E2 = { recordset: [{ InternalId: 1, Name: 'Enhetsnavn 2' }], output: {}, rowsAffected: [1] }
    const ONE_MATCHING_DIFFERENT_NAME_UNIT_SQL_RESULT = { recordset: [{ InternalId: 1, Name: 'eNhEtSnAvN 1' }], output: {}, rowsAffected: [1] }
    const INSERT_ID_2_SQL_RESULT = { recordset: [{ InsertId: 2 }], output: {}, rowsAffected: [1, 1] }
    const TWO_UNITS_IN_DATABASE_SQL_RESULT = { recordset: [{ InternalId: 1, OrganisationId: '101-1001' }, { InternalId: 2, OrganisationId: '102-1002' }], output: {}, rowsAffected: [2] }

    const ONE_MATCHING_EXISTING_PERSON_SQL_RESULT = { recordset: [{ InternalId: 1, JobTitle: 'Ansatt', PrimaryPosition: 'false' }], output: {}, rowsAffected: [1] }
    const ONE_MATCHING_EXISTING_PERSON_SQL_RESULT_P1 = { recordset: [{ InternalId: 2, JobTitle: 'Konsulent', PrimaryPosition: 'true' }], output: {}, rowsAffected: [1] }
    const ONE_MATCHING_EXISTING_PERSON_SQL_RESULT_P2 = { recordset: [{ InternalId: 1, JobTitle: 'Ingeniør', PrimaryPosition: 'false' }], output: {}, rowsAffected: [1] }
    const TWO_POSITIONS_IN_DATABASE_SQL_RESULT = { recordset: [{ InternalId: 1, OrganisationId: '101-1001', SocialSecurityNumber: '01020304050' }, { InternalId: 2, OrganisationId: '102-1002', SocialSecurityNumber: '01020304050' }], output: {}, rowsAffected: [2] }

    const EMPLOYEE_WITH_SINGLE_POSITION_UNIT_1 = { familyName: 'FamilyName', givenName: 'GivenName', ssn: '01020304050', employeeId: '11', positions: [{ isPrimaryPosition: true, startDate: '2020-02-01', organisationId: '101', unitId: '1001', name: 'Konsulent' }] }
    const EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2 = { familyName: 'FamilyName', givenName: 'GivenName', ssn: '01020304050', employeeId: '11', positions: [{ isPrimaryPosition: true, startDate: '2020-02-01', organisationId: '102', unitId: '1002', name: 'Konsulent' }] }
    const EMPLOYEE_WITH_TWO_POSITIONS = { familyName: 'FamilyName', givenName: 'GivenName', ssn: '01020304050', employeeId: '11', positions: [{ isPrimaryPosition: true, startDate: '2020-02-01', organisationId: '101', unitId: '1001', name: 'Konsulent' }, { isPrimaryPosition: false, startDate: '2020-02-01', organisationId: '102', unitId: '1002', name: 'Ingeniør' }] }

    const EMPTY_PERSONS_LIST = Promise.resolve([])
    const FILLER_EMPTY_SQL_RESULT = { recordset: [], output: {}, rowsAffected: [0] }

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
    })

    describe('common', () => {
        beforeEach(() => {
            worker = new VismaDatabaseSyncWorker(logMock, sqlMock, vismaDataSourceMock, undefined, undefined)
        })

        it('debug logs when a new instance is created', () => {
            expect(logMock.debug).toHaveBeenCalledWith('VismaDatabaseSyncWorker created.')
        })

        it('has set its name', () => {
            expect(worker.name).toEqual('VismaDatabaseSyncWorker')
        })
    })

    describe('works for single id and single value tables', () => {
        beforeEach(() => {
            worker = new VismaDatabaseSyncWorker(
                logMock,
                sqlMock,
                vismaDataSourceMock,
                { tablename: 'Organisation', columns: ['OrganisationId', 'Name'], id_columns: ['OrganisationId'], value_columns: ['Name'] },
                {
                    createMap: async (person, position_i) => {
                        return {
                            OrganisationId: person.positions[position_i].organisationId + '-' + person.positions[position_i].unitId,
                            Name: person.positions[position_i].unitId === '1001' ? 'Enhetsnavn 1' : 'Enhetsnavn 2',
                        }
                    }
                })
        })

        describe('when database is empty', () => {
            beforeEach(() => {
                queryReturns.push(NO_MATCHING_EXISTING_UNIT_SQL_RESULT)
            })

            describe('single user with single unit', () => {
                beforeEach(() => {
                    queryReturns.push(FILLER_EMPTY_SQL_RESULT)
                    queryReturns.push(FILLER_EMPTY_SQL_RESULT)
                })

                it('calls input with correct parameter for organisation id', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_1]))

                    await worker.run()

                    expect(requests[1].input).toHaveBeenCalledWith('OrganisationId', '101-1001')
                })

                it('calls input with correct parameter for name', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_1]))

                    await worker.run()

                    expect(requests[1].input).toHaveBeenCalledWith('Name', 'Enhetsnavn 1')
                })

                it('inserts found units in database with correct query', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_1]))

                    await worker.run()

                    expect(requests[1].query).toHaveBeenCalledWith('INSERT INTO Organisation (OrganisationId,Name) VALUES (@OrganisationId,@Name)')
                })
            })

            describe('single user with multiple units', () => {
                beforeEach(() => {
                    queryReturns.push(NO_MATCHING_EXISTING_UNIT_SQL_RESULT)
                    queryReturns.push(NO_MATCHING_EXISTING_UNIT_SQL_RESULT)
                    queryReturns.push(FILLER_EMPTY_SQL_RESULT)
                    queryReturns.push(FILLER_EMPTY_SQL_RESULT)
                })

                it('calls input with correct parameter for organisation id', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_TWO_POSITIONS]))

                    await worker.run()

                    expect(requests[1].input).toHaveBeenCalledWith('OrganisationId', '101-1001')
                    expect(requests[3].input).toHaveBeenCalledWith('OrganisationId', '102-1002')
                })

                it('calls input with correct parameter for name', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_TWO_POSITIONS]))

                    await worker.run()

                    expect(requests[1].input).toHaveBeenCalledWith('Name', 'Enhetsnavn 1')
                    expect(requests[3].input).toHaveBeenCalledWith('Name', 'Enhetsnavn 2')
                })

                it('inserts found units in database with correct query', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_TWO_POSITIONS]))

                    await worker.run()

                    for (let i = 1; i < requests.length; i += 2) {
                        expect(requests[i].query).toHaveBeenCalledWith('INSERT INTO Organisation (OrganisationId,Name) VALUES (@OrganisationId,@Name)')
                    }
                })
            })
        })

        describe('database already contains non-expired unit', () => {
            describe('looks up existing unit and does not add it again', () => {
                beforeEach(() => {
                    queryReturns.push(ONE_MATCHING_EXISTING_UNIT_SQL_RESULT_E2)
                    queryReturns.push(FILLER_EMPTY_SQL_RESULT)
                })

                it('calls input with correct organisationId parameter', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                    await worker.run()

                    expect(requests[0].input).toHaveBeenCalledWith('OrganisationId', '102-1002')
                })

                it('calls query with correct sql', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                    await worker.run()

                    expect(requests[0].query).toHaveBeenCalledWith('SELECT InternalId,Name FROM Organisation WHERE ToDate IS NULL AND NewVersionId IS NULL AND OrganisationId=@OrganisationId')
                })

                it("does not insert new unit with matching name and id's already in database", async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                    await worker.run()

                    sqlExpect(requests).not.toHaveRunQuery('INSERT INTO Organisation (OrganisationId,Name) VALUES (@organisationId,@name)')
                })
            })

            describe("inserts new unit and updates previous when name has changed for id already in database", () => {
                beforeEach(() => {
                    queryReturns.push(ONE_MATCHING_DIFFERENT_NAME_UNIT_SQL_RESULT)
                    queryReturns.push(INSERT_ID_2_SQL_RESULT)
                    queryReturns.push(FILLER_EMPTY_SQL_RESULT)
                    queryReturns.push(FILLER_EMPTY_SQL_RESULT)
                })

                describe('new', () => {
                    it('calls input with correct name parameter', async () => {
                        vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                        await worker.run()

                        expect(requests[1].input).toHaveBeenCalledWith('Name', 'Enhetsnavn 2')
                    })

                    it('calls input with correct organisationId parameter', async () => {
                        vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                        await worker.run()

                        expect(requests[1].input).toHaveBeenCalledWith('OrganisationId', '102-1002')
                    })

                    it('inserts new unit with new name and same id', async () => {
                        vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                        await worker.run()

                        sqlExpect(requests).toHaveRunQuery('INSERT INTO Organisation (OrganisationId,Name) VALUES (@OrganisationId,@Name);SELECT SCOPE_IDENTITY() AS InsertId')
                    })
                })

                describe('update', () => {
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

            describe('expires units not found in add/update step', () => {
                beforeEach(() => {
                    queryReturns.push(TWO_UNITS_IN_DATABASE_SQL_RESULT)
                })

                it('retrieves list of units with correct sql', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(EMPTY_PERSONS_LIST)

                    await worker.run()

                    sqlExpect(requests).toHaveRunQuery('SELECT InternalId,OrganisationId FROM Organisation WHERE ToDate IS NULL AND NewVersionId IS NULL')
                })

                for (const { testName, internalId } of [
                    { testName: 'Expires item in database with InternalId 1', internalId: 1 },
                    { testName: 'Expires item in database with InternalId 2', internalId: 2 }
                ]) {
                    it(testName, async () => {
                        vismaDataSourceMock.getPersons.and.returnValue(EMPTY_PERSONS_LIST)

                        await worker.run()

                        sqlExpect(requests)
                            .toHaveRunQuery('UPDATE Organisation SET ToDate=GETDATE() WHERE InternalId=@internalId')
                            .withParameter('internalId', internalId)
                    })
                }

            })

            describe('does not delete non-expired items', () => {
                it('expiry sql is not run', async () => {
                    queryReturns.push(ONE_MATCHING_EXISTING_UNIT_SQL_RESULT_E1)
                    queryReturns.push(ONE_MATCHING_EXISTING_UNIT_SQL_RESULT_E2)
                    queryReturns.push(TWO_UNITS_IN_DATABASE_SQL_RESULT)
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_TWO_POSITIONS]))

                    await worker.run()

                    sqlExpect(requests).not.toHaveRunQuery('UPDATE Organisation SET ToDate=GETDATE() WHERE InternalId=@internalId')
                })
            })
        })
    })

    describe('works for multiple id and multiple value tables', () => {
        beforeEach(() => {
            worker = new VismaDatabaseSyncWorker(
                logMock,
                sqlMock,
                vismaDataSourceMock,
                { tablename: 'EmployeePosition', columns: ['OrganisationId', 'SocialSecurityNumber', 'JobTitle', 'PrimaryPosition'], id_columns: ['OrganisationId', 'SocialSecurityNumber'], value_columns: ['JobTitle', 'PrimaryPosition'] },
                {
                    createMap: async (person, position_i) => {
                        return {
                            OrganisationId: person.positions[position_i].organisationId + '-' + person.positions[position_i].unitId,
                            SocialSecurityNumber: person.ssn,
                            JobTitle: person.positions[position_i].name,
                            PrimaryPosition: person.positions[position_i].isPrimaryPosition,
                        }
                    }
                })
        })

        describe('when database is empty', () => {
            beforeEach(() => {
                queryReturns.push(NO_MATCHING_EXISTING_UNIT_SQL_RESULT)
            })

            describe('single user with single employment', () => {
                beforeEach(() => {
                    queryReturns.push(FILLER_EMPTY_SQL_RESULT)
                    queryReturns.push(FILLER_EMPTY_SQL_RESULT)
                })

                it('inserts new row with correct sql and parameter values', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_1]))

                    await worker.run()

                    sqlExpect(requests)
                        .toHaveRunQuery('INSERT INTO EmployeePosition (OrganisationId,SocialSecurityNumber,JobTitle,PrimaryPosition) VALUES (@OrganisationId,@SocialSecurityNumber,@JobTitle,@PrimaryPosition)')
                        .withParameter('OrganisationId', '101-1001')
                        .withParameter('SocialSecurityNumber', '01020304050')
                        .withParameter('JobTitle', 'Konsulent')
                        .withParameter('PrimaryPosition', 'true')
                })
            })

            describe('single user with multiple units', () => {
                beforeEach(() => {
                    queryReturns.push(NO_MATCHING_EXISTING_UNIT_SQL_RESULT)
                    queryReturns.push(NO_MATCHING_EXISTING_UNIT_SQL_RESULT)
                    queryReturns.push(FILLER_EMPTY_SQL_RESULT)
                    queryReturns.push(FILLER_EMPTY_SQL_RESULT)
                })

                it('inserts new row with correct sql and parameter values for first employment', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_TWO_POSITIONS]))

                    await worker.run()

                    sqlExpect(requests)
                        .toHaveRunQuery('INSERT INTO EmployeePosition (OrganisationId,SocialSecurityNumber,JobTitle,PrimaryPosition) VALUES (@OrganisationId,@SocialSecurityNumber,@JobTitle,@PrimaryPosition)')
                        .withParameter('OrganisationId', '101-1001')
                        .withParameter('SocialSecurityNumber', '01020304050')
                        .withParameter('JobTitle', 'Konsulent')
                        .withParameter('PrimaryPosition', 'true')
                })

                it('inserts new row with correct sql and parameter values for second employment', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_TWO_POSITIONS]))

                    await worker.run()

                    sqlExpect(requests)
                        .toHaveRunQuery('INSERT INTO EmployeePosition (OrganisationId,SocialSecurityNumber,JobTitle,PrimaryPosition) VALUES (@OrganisationId,@SocialSecurityNumber,@JobTitle,@PrimaryPosition)')
                        .withParameter('OrganisationId', '102-1002')
                        .withParameter('SocialSecurityNumber', '01020304050')
                        .withParameter('JobTitle', 'Ingeniør')
                        .withParameter('PrimaryPosition', 'false')
                })
            })
        })

        describe('database already contains non-expired position', () => {
            describe('looks up existing position and does not add it again', () => {
                beforeEach(() => {
                    queryReturns.push(ONE_MATCHING_EXISTING_PERSON_SQL_RESULT)
                    queryReturns.push(INSERT_ID_2_SQL_RESULT)
                    queryReturns.push(FILLER_EMPTY_SQL_RESULT)
                    queryReturns.push(FILLER_EMPTY_SQL_RESULT)

                })

                it('calls query with correct sql and parameter values', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                    await worker.run()

                    sqlExpect(requests).toHaveRunQuery('SELECT InternalId,JobTitle,PrimaryPosition FROM EmployeePosition WHERE ToDate IS NULL AND NewVersionId IS NULL AND OrganisationId=@OrganisationId AND SocialSecurityNumber=@SocialSecurityNumber')
                        .withParameter('OrganisationId', '102-1002')
                        .withParameter('SocialSecurityNumber', '01020304050')
                })

                it("does not insert new position with matching jobtitle and primaryposition and id's already in database", async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                    await worker.run()

                    sqlExpect(requests).not.toHaveRunQuery('INSERT INTO EmployeePosition (OrganisationId,SocialSecurityNumber,JobTitle,PrimaryPosition) VALUES (@OrganisationId,@SocialSecurityNumber,@JobTitle,@PrimaryPosition)')
                })
            })

            describe("jobitle/primaryposition has changed for id already in database", () => {
                beforeEach(() => {
                    queryReturns.push(ONE_MATCHING_EXISTING_PERSON_SQL_RESULT)
                    queryReturns.push(INSERT_ID_2_SQL_RESULT)
                    queryReturns.push(FILLER_EMPTY_SQL_RESULT)
                    queryReturns.push(FILLER_EMPTY_SQL_RESULT)
                })

                describe('inserts new position', () => {
                    it('inserts new unit with new name and same id', async () => {
                        vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                        await worker.run()

                        sqlExpect(requests)
                            .toHaveRunQuery('INSERT INTO EmployeePosition (OrganisationId,SocialSecurityNumber,JobTitle,PrimaryPosition) VALUES (@OrganisationId,@SocialSecurityNumber,@JobTitle,@PrimaryPosition);SELECT SCOPE_IDENTITY() AS InsertId')
                            .withParameter('OrganisationId', '102-1002')
                            .withParameter('SocialSecurityNumber', '01020304050')
                            .withParameter('JobTitle', 'Konsulent')
                            .withParameter('PrimaryPosition', 'true')
                    })
                })

                describe('updates previous', () => {
                    it('inserts new unit with new name and same id', async () => {
                        vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_2]))

                        await worker.run()

                        sqlExpect(requests)
                            .toHaveRunQuery('UPDATE EmployeePosition SET ToDate=GETDATE(),NewVersionId=@newInternalId WHERE InternalId=@oldInternalId')
                            .withParameter('oldInternalId', '1')
                            .withParameter('newInternalId', '2')
                    })
                })
            })

            describe('expires positions not found in add/update step', () => {
                beforeEach(() => {
                    queryReturns.push(TWO_POSITIONS_IN_DATABASE_SQL_RESULT)
                })

                it('retrieves list of units with correct sql', async () => {
                    vismaDataSourceMock.getPersons.and.returnValue(EMPTY_PERSONS_LIST)

                    await worker.run()

                    sqlExpect(requests).toHaveRunQuery('SELECT InternalId,OrganisationId,SocialSecurityNumber FROM EmployeePosition WHERE ToDate IS NULL AND NewVersionId IS NULL')
                })

                for (const { testName, internalId } of [
                    { testName: 'Expires item in database with InternalId 1', internalId: 1 },
                    { testName: 'Expires item in database with InternalId 2', internalId: 2 }
                ]) {
                    it(testName, async () => {
                        vismaDataSourceMock.getPersons.and.returnValue(EMPTY_PERSONS_LIST)

                        await worker.run()

                        sqlExpect(requests)
                            .toHaveRunQuery('UPDATE EmployeePosition SET ToDate=GETDATE() WHERE InternalId=@internalId')
                            .withParameter('internalId', internalId)
                    })
                }

                it('does not expire items in database that is also in syncdata', async () => {
                    queryReturns.unshift(ONE_MATCHING_EXISTING_PERSON_SQL_RESULT_P1)
                    queryReturns.unshift(FILLER_EMPTY_SQL_RESULT)
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_SINGLE_POSITION_UNIT_1]))

                    await worker.run()

                    sqlExpect(requests)
                        .toHaveRunQuery('UPDATE EmployeePosition SET ToDate=GETDATE() WHERE InternalId=@internalId')
                        .not.withParameter('InternalId', '2')
                })

            })

            describe('does not delete non-expired items', () => {
                it('expiry sql is not run', async () => {
                    queryReturns.push(ONE_MATCHING_EXISTING_PERSON_SQL_RESULT_P1)
                    queryReturns.push(ONE_MATCHING_EXISTING_PERSON_SQL_RESULT_P2)
                    queryReturns.push(TWO_POSITIONS_IN_DATABASE_SQL_RESULT)
                    vismaDataSourceMock.getPersons.and.returnValue(Promise.resolve([EMPLOYEE_WITH_TWO_POSITIONS]))

                    await worker.run()

                    sqlExpect(requests).not.toHaveRunQuery('UPDATE EmployeePosition SET ToDate=GETDATE() WHERE InternalId=@internalId')
                })
            })
        })
    })
})