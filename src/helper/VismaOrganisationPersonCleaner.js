// Matches every position with the organisation data and removes any positions
// belonging to units that doesn't exist in the organisation chart export.
function VismaOrganisationPersonCleaner(personsSource, organisations) {
    return {
        getPersons: async () => {
            let persons = await personsSource.getPersons()
            organisations = await organisations
            let cleaned = []

            for (let person_i = 0; person_i < persons.length; person_i++) {
                const person = Object.assign({}, persons[person_i])
                person.positions = Array.from(person.positions)
                cleaned.push(person)
                for (let position_i = 0; position_i < person.positions.length; position_i++) {
                    const position = person.positions[position_i]
                    let filterUnit = organisations.filter(x => x.unitId === position.unitId)
                    if (filterUnit.length === 0) {
                        person.positions.splice(position_i, 1)
                    }
                }
            }

            return cleaned
        }
    }
}

module.exports = VismaOrganisationPersonCleaner