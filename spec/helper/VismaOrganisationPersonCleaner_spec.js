describe('VismaOrganisationPersonCleaner', () => {
    const VismaOrganisationPersonCleaner = require('../../src/helper/VismaOrganisationPersonCleaner')

    const ONE_PERSON_ONE_POSITION = [{
        internalId: '1',
        employeeId: '2',
        familyName: 'Etternavn',
        givenName: 'Fornavn',
        ssn: '12345678910',
        positions: [{
            organisationId: '3', unitId: '4', name: 'Tittel', startDate: new Date(), isPrimaryPosition: 'true'
        }]
    }]

    const ONE_PERSON_TWO_POSITIONS = [{
        internalId: '1',
        employeeId: '2',
        familyName: 'Etternavn',
        givenName: 'Fornavn',
        ssn: '12345678910',
        positions: [
            { organisationId: '3', unitId: '4', name: 'Tittel', startDate: new Date(), isPrimaryPosition: 'true' },
            { organisationId: '3', unitId: '6', name: 'Tittel', startDate: new Date(), isPrimaryPosition: 'false' }
        ]
    }]

    const ONE_PERSON_NO_POSITION = [{
        internalId: '1',
        employeeId: '2',
        familyName: 'Etternavn',
        givenName: 'Fornavn',
        ssn: '12345678910',
        positions: []
    }]

    const ONE_UNIT = Promise.resolve([{ chartId: '3', unitId: '4' }])
    const TWO_UNITS = Promise.resolve([{ chartId: '3', unitId: '4' }, { chartId: '3', unitId: '6' }])

    function getPersonsify(persons) {
        return {
            getPersons: async () => {
                return persons
            }
        }
    }

    it('returns position when unit exists', async () => {
        expect(await VismaOrganisationPersonCleaner(getPersonsify(ONE_PERSON_ONE_POSITION), ONE_UNIT).getPersons()).toEqual(ONE_PERSON_ONE_POSITION)
    })

    it('returns all positions when every unit exists', async () => {
        expect(await VismaOrganisationPersonCleaner(getPersonsify(ONE_PERSON_TWO_POSITIONS), TWO_UNITS).getPersons()).toEqual(ONE_PERSON_TWO_POSITIONS)
    })

    it('returns no positions when no unit exists', async () => {
        expect(await VismaOrganisationPersonCleaner(getPersonsify(ONE_PERSON_ONE_POSITION), []).getPersons()).toEqual(ONE_PERSON_NO_POSITION)
    })
})