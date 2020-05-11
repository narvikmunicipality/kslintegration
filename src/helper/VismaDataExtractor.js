function VismaDataExtractor() {
    return {
        Organisation: {
            createMap: (person, position_i) => {
                return {
                    OrganisationId: person.positions[position_i].organisationId + '-' + person.positions[position_i].unitId,
                    Name: person.positions[position_i].unitName,
                }
            }
        },
        Person: {
            createMap: (person) => {
                return {
                    SocialSecurityNumber: person.ssn,
                    FirstName: person.givenName, 
                    LastName: person.familyName,
                    EmployeeId: person.employeeId,
                    Email: 'mangler'
                }
            }
        },
        EmployeePosition: {
            createMap: (person, position_i) => {
                if (person.positions[position_i].isPrimaryPosition === undefined) { console.log(JSON.stringify(person) + `--(${position_i})--`) }
                return {
                    OrganisationId: person.positions[position_i].organisationId + '-' + person.positions[position_i].unitId,
                    SocialSecurityNumber: person.ssn,
                    JobTitle: person.positions[position_i].name, 
                    PrimaryPosition: person.positions[position_i].isPrimaryPosition.toString()
                }
            }
        }
    }
}

module.exports = VismaDataExtractor