// DatabaseSync worker was originally only working with the person data export,
// however when dedicated organisation chart data was introduced with parentid
// for units, some units would not be created since they had no employees
// directly under them but in a sub unit.
// This creates fake person data only to have the worker create every unit
// regardless of it containing employees, by creating a fake person that works
// in every available unit returned from the organisation chart export.
function VismaOrganisationToPersonListConverter(organisationData) {
    return {
        getPersons: async () => {
            organisationData = await organisationData
            let unitPositions = []

            for (let organisation_i = 0; organisation_i < organisationData.length; organisation_i++) {
                const organisation = organisationData[organisation_i];
                unitPositions.push({ organisationId: organisation.chartId, unitId: organisation.unitId })
            }

            return [{
                positions: unitPositions
            }]
        }
    }
}

module.exports = VismaOrganisationToPersonListConverter