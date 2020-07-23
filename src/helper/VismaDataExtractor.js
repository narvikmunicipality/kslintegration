function VismaDataExtractor() {
    return {
        Organisation: vismaUnits => {
            return {
                createMap: async (person, position_i) => {
                    const unit = (await vismaUnits).filter(x => x.unitId === person.positions[position_i].unitId)[0]

                    return {
                        OrganisationId: person.positions[position_i].organisationId + '-' + person.positions[position_i].unitId,
                        Name: unit.name,
                        ParentId: unit.parentId === '' ? '' : person.positions[position_i].organisationId + '-' + unit.parentId,
                    }
                }
            }
        },
        Person: ssnToMailMap => {
            return {
                createMap: async (person) => {
                    async function lookupMail(ssn) {
                        const match = (await ssnToMailMap).filter(x => x.ssn === ssn)
                        return match.length === 0 || match.length > 0 && match[0].mail.trim().length === 0 ? 'har.ikke.e-post@example.com' : match[0].mail
                    }

                    return {
                        SocialSecurityNumber: person.ssn,
                        FirstName: person.givenName,
                        LastName: person.familyName,
                        EmployeeId: person.employeeId,
                        Email: await lookupMail(person.ssn)
                    }
                }
            }
        },
        EmployeePosition: vismaUnits => {
            return {
                createMap: async (person, position_i) => {
                    const unitManagerId = (await vismaUnits).filter(x => x.unitId === person.positions[position_i].unitId)[0].managerId

                    return {
                        OrganisationId: person.positions[position_i].organisationId + '-' + person.positions[position_i].unitId,
                        SocialSecurityNumber: person.ssn,
                        JobTitle: person.positions[position_i].name,
                        PrimaryPosition: person.positions[position_i].isPrimaryPosition.toString(),
                        ManagerPosition: (unitManagerId === person.internalId).toString(),
                    }
                }
            }
        }
    }
}

module.exports = VismaDataExtractor