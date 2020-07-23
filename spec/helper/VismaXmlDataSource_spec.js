describe('VismaXmlDataSource', () => {
    const VismaXmlDataSource = require('../../src/helper/VismaXmlDataSource')
    const fsfread = require('util').promisify(require('fs').readFile)
    const xml2js = xml => require('xml-js').xml2js(xml, { compact: true })

    var source, logMock, configStub

    beforeEach(() => {
        logMock = jasmine.createSpyObj('log', ['error'])
        configStub = { manager_codes: ['1111'] }
        jasmine.clock().install()
        jasmine.clock().mockDate(new Date('2020-04-30'))
    })

    afterEach(() => {
        jasmine.clock().uninstall()
    })

    function createDataSourceForXml(xmlPath) {
        return new VismaXmlDataSource(logMock, fsfread(xmlPath), xml2js, configStub)
    }

    describe('persons with every field', () => {
        beforeEach(async () => {
            source = createDataSourceForXml('spec/testdata/visma.xml')
        })

        for (const { testName, personsIndex, employeeId } of [
            { testName: 'First person has correct employeeId', personsIndex: 0, employeeId: '11' },
            { testName: 'Second person has correct employeeId', personsIndex: 1, employeeId: '12' }
        ]) {
            it(testName, async () => {
                expect((await source.getPersons())[personsIndex].employeeId).toEqual(employeeId)
            })
        }

        for (const { testName, personsIndex, familyName } of [
            { testName: 'First person has correct familyName', personsIndex: 0, familyName: 'Nordmann' },
            { testName: 'Second person has correct familyName', personsIndex: 1, familyName: 'Sørmann' }
        ]) {
            it(testName, async () => {
                expect((await source.getPersons())[personsIndex].familyName).toEqual(familyName)
            })
        }

        for (const { testName, personsIndex, givenName: givenName } of [
            { testName: 'First person has correct givenName', personsIndex: 0, givenName: 'Ola' },
            { testName: 'Second person has correct givenName', personsIndex: 1, givenName: 'Kari' }
        ]) {
            it(testName, async () => {
                expect((await source.getPersons())[personsIndex].givenName).toEqual(givenName)
            })
        }

        for (const { testName, personsIndex, ssn: ssn } of [
            { testName: 'First person has correct ssn', personsIndex: 0, ssn: '01020304050' },
            { testName: 'Second person has correct ssn', personsIndex: 1, ssn: '05040302010' }
        ]) {
            it(testName, async () => {
                expect((await source.getPersons())[personsIndex].ssn).toEqual(ssn)
            })
        }

        for (const { testName, personsIndex, internalId: internalId } of [
            { testName: 'First person has correct internal HRM ID', personsIndex: 0, internalId: '1' },
            { testName: 'Second person has correct internal HRM ID', personsIndex: 1, internalId: '2' }
        ]) {
            it(testName, async () => {
                expect((await source.getPersons())[personsIndex].internalId).toEqual(internalId)
            })
        }

        for (const { testName, personsIndex, positions: positions } of [
            { testName: 'First persons active positions is not filtered', personsIndex: 0, positions: 2 },
            { testName: 'Second persons inactive position is filtered', personsIndex: 1, positions: 1 }
        ]) {
            it(testName, async () => {
                expect((await source.getPersons())[personsIndex].positions.length).toEqual(positions)
            })
        }

        for (const { testName, personsIndex, positionIndex, isPrimaryPosition: isPrimaryPosition } of [
            { testName: 'First persons first position is primary', personsIndex: 0, positionIndex: 0, isPrimaryPosition: true },
            { testName: 'First persons second position is not primary', personsIndex: 0, positionIndex: 1, isPrimaryPosition: false },
            { testName: 'Second persons position is primary', personsIndex: 1, positionIndex: 0, isPrimaryPosition: true }
        ]) {
            it(testName, async () => {
                expect((await source.getPersons())[personsIndex].positions[positionIndex].isPrimaryPosition).toBe(isPrimaryPosition)
            })
        }

        for (const { testName, personsIndex, positionIndex, organisationId: organisationId } of [
            { testName: 'First persons first position has correct organisationId', personsIndex: 0, positionIndex: 0, organisationId: '101' },
            { testName: 'First persons second position has correct organisationId', personsIndex: 0, positionIndex: 1, organisationId: '101' },
            { testName: 'Second persons position has correct organisationId', personsIndex: 1, positionIndex: 0, organisationId: '101' }
        ]) {
            it(testName, async () => {
                expect((await source.getPersons())[personsIndex].positions[positionIndex].organisationId).toEqual(organisationId)
            })
        }

        for (const { testName, personsIndex, positionIndex, unitId: unitId } of [
            { testName: 'First persons first position has correct unitId', personsIndex: 0, positionIndex: 0, unitId: '1001' },
            { testName: 'First persons second position has correct unitId', personsIndex: 0, positionIndex: 1, unitId: '1002' },
            { testName: 'Second persons position has correct unitId', personsIndex: 1, positionIndex: 0, unitId: '1003' }
        ]) {
            it(testName, async () => {
                expect((await source.getPersons())[personsIndex].positions[positionIndex].unitId).toEqual(unitId)
            })
        }

        for (const { testName, personsIndex, positionIndex, name: name } of [
            { testName: 'First persons first position has correct name', personsIndex: 0, positionIndex: 0, name: 'Konsulent' },
            { testName: 'First persons second position has correct name', personsIndex: 0, positionIndex: 1, name: 'Ingeniør' },
            { testName: 'Second persons position has correct name', personsIndex: 1, positionIndex: 0, name: 'Leder' }
        ]) {
            it(testName, async () => {
                expect((await source.getPersons())[personsIndex].positions[positionIndex].name).toEqual(name)
            })
        }

        for (const { testName, personsIndex, positionIndex, startDate: startDate } of [
            { testName: 'First persons first position has correct startDate', personsIndex: 0, positionIndex: 0, startDate: new Date('2020-02-01') },
            { testName: 'First persons second position has correct startDate', personsIndex: 0, positionIndex: 1, startDate: new Date('2020-03-01') },
            { testName: 'Second persons position has correct startDate', personsIndex: 1, positionIndex: 0, startDate: new Date('2020-01-01') }
        ]) {
            it(testName, async () => {
                expect((await source.getPersons())[personsIndex].positions[positionIndex].startDate).toEqual(startDate)
            })
        }
    })

    describe('person with no positions', () => {
        beforeEach(async () => {
            source = createDataSourceForXml('spec/testdata/visma_person_with_no_positions.xml')
        })

        it('positions is empty array', async () => {
            expect((await source.getPersons())[0].positions.length).toEqual(0)
        })
    })

    describe('person with no positionCode', () => {
        beforeEach(async () => {
            source = createDataSourceForXml('spec/testdata/visma_person_with_no_positioncode.xml')
        })

        it('position name is set to position type', async () => {
            expect((await source.getPersons())[0].positions[0].name).toEqual('Stillingstype')
        })
    })

    describe('person with no chart', () => {
        beforeEach(async () => {
            source = createDataSourceForXml('spec/testdata/visma_person_with_no_chart.xml')
        })

        it('positions is empty array', async () => {
            expect((await source.getPersons())[0].positions.length).toEqual(0)
        })
    })

    describe('person with no chart or dimension2', () => {
        beforeEach(async () => {
            source = createDataSourceForXml('spec/testdata/visma_person_with_no_chart_or_dimension2.xml')
        })

        it('positions is empty array', async () => {
            expect((await source.getPersons())[0].positions.length).toEqual(0)
        })
    })

    describe('person with no dimension2', () => {
        beforeEach(async () => {
            source = createDataSourceForXml('spec/testdata/visma_person_with_no_dimension2.xml')
        })

        it('positions is empty array', async () => {
            expect((await source.getPersons())[0].positions.length).toEqual(0)
        })
    })

    describe('person with two positions in same unit as primary', () => {
        beforeEach(async () => {
            source = createDataSourceForXml('spec/testdata/visma_person_with_multiple_position_same_unit_as_primary.xml')
        })

        it('positions is truncated to only one', async () => {
            expect((await source.getPersons())[0].positions.length).toEqual(1)
        })

        it('position left is primary position', async () => {
            expect((await source.getPersons())[0].positions[0].isPrimaryPosition).toBe(true)
        })
    })

    describe('person with two positions in same unit and single unit for primary', () => {
        beforeEach(async () => {
            source = createDataSourceForXml('spec/testdata/visma_person_with_multiple_position_same_unit_not_as_primary.xml')
        })

        it('positions is truncated to two', async () => {
            expect((await source.getPersons())[0].positions.length).toEqual(2)
        })

        it('first position is primary position', async () => {
            expect((await source.getPersons())[0].positions[0].isPrimaryPosition).toBe(true)
        })

        it('second position is not primary position', async () => {
            expect((await source.getPersons())[0].positions[1].isPrimaryPosition).toBe(false)
        })
    })

    describe('person with no start date', () => {
        beforeEach(async () => {
            source = createDataSourceForXml('spec/testdata/visma_person_with_no_startdate.xml')
        })

        it('uses validFromDate instead', async () => {
            expect((await source.getPersons())[0].positions[0].startDate).toEqual(new Date('2020-04-03'))
        })
    })

    describe('person with no unit id', () => {
        beforeEach(async () => {
            source = createDataSourceForXml('spec/testdata/visma_person_with_no_unit_id.xml')
        })

        it('Fall backs to using cost centres unit id', async () => {
            expect((await source.getPersons())[0].positions[0].unitId).toEqual('1001')
        })
    })

    describe('person with unit id and no dimension2', () => {
        beforeEach(async () => {
            source = createDataSourceForXml('spec/testdata/visma_person_with_unitid_and_no_dimension2.xml')
        })

        it('returns chart→unit unit id', async () => {
            expect((await source.getPersons())[0].positions[0].unitId).toEqual('1001')
        })
    })    
})