describe('VismaOrganisationToPersonListConverter', () => {
    const VismaOrganisationToPersonListConverter = require('../../src/helper/VismaOrganisationToPersonListConverter')

    const SINGLE_UNIT = Promise.resolve([{ chartId: '10', unitId: '1' }])
    const TWO_UNITS = Promise.resolve([{ chartId: '10', unitId: '1' }, { chartId: '10', unitId: '2' }])

    it('converts a single unit to person list', async () => {
        let converter = new VismaOrganisationToPersonListConverter(SINGLE_UNIT)

        let result = await converter.getPersons()

        expect(result).toEqual([{ positions: [{ organisationId: '10', unitId: '1' }] }])
    })

    it('converts a multiple units to person list', async () => {
        let converter = new VismaOrganisationToPersonListConverter(TWO_UNITS)

        let result = await converter.getPersons()

        expect(result).toEqual([{ positions: [{ organisationId: '10', unitId: '1' }, { organisationId: '10', unitId: '2' }] }])
    })
})