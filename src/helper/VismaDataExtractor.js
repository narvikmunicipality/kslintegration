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
        Person: ssnToMailMap => {
            return {
                createMap: (person) => {
                    function lookupMail(ssn) {
                        const match = ssnToMailMap.filter(x => x.ssn === ssn)
                        return match.length === 0 || match.length > 0 && match[0].mail.trim().length === 0 ? 'har.ikke.e-post@example.com' : match[0].mail
                    }

                    return {
                        SocialSecurityNumber: person.ssn,
                        FirstName: person.givenName,
                        LastName: person.familyName,
                        EmployeeId: person.employeeId,
                        Email: lookupMail(person.ssn)
                    }
                }
            }
        },
        EmployeePosition: {
            createMap: (person, position_i) => {
                return {
                    OrganisationId: person.positions[position_i].organisationId + '-' + person.positions[position_i].unitId,
                    SocialSecurityNumber: person.ssn,
                    JobTitle: person.positions[position_i].name,
                    PrimaryPosition: person.positions[position_i].isPrimaryPosition.toString(),
                    ManagerPosition: person.positions[position_i].isManagerPosition.toString(),
                }
            }
        }
    }
}

module.exports = VismaDataExtractor