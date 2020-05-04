function VismaXmlDataSource(vismaXmlPath, fileReader, parseXml) {
    return {
        getPersons: async () => {
            let xml = await parseXml(await fileReader(vismaXmlPath))
            let personList = xml.personsXML.person
            let persons = []

            for (let person_i = 0; person_i < personList.length; person_i++) {
                const xmlPerson = personList[person_i];

                let positions = []
                for (let position_i = 0; position_i < xmlPerson.employments.employment.positions.position.length; position_i++) {
                    const position = xmlPerson.employments.employment.positions.position[position_i];

                    if (position.positionEndDate && new Date(position.positionEndDate._text) <= new Date()) {
                        continue
                    }
                    
                    positions.push({
                        organisationId: position.chart._attributes.id,
                        unitId: position.chart.unit._attributes.id,
                        name: position.positionInfo.positionCode._attributes.name,
                        startDate: new Date(position.positionStartDate._text),
                        endDate: position.positionEndDate && new Date(position.positionEndDate._text),
                        isPrimary: position._attributes.isPrimaryPosition == 'true',
                    })
                }

                persons.push({
                    internalId: xmlPerson._attributes.personIdHRM,
                    employeeId: xmlPerson.employments.employment.employeeId._text,
                    familyName: xmlPerson.familyName._text,
                    givenName: xmlPerson.givenName._text,
                    ssn: xmlPerson.ssn._text,
                    positions: positions
                })
            }

            return persons
        }
    }
}

module.exports = VismaXmlDataSource