function VismaXmlDataSource(vismaXmlPath, fileReader, parseXml) {
    function isExpired(position) {
        return position.positionEndDate && new Date(position.positionEndDate._text) <= new Date()
    }

    function isMissingChart(position) {
        return position.chart === undefined
    }

    return {
        getPersons: async () => {
            let xml = await parseXml(await fileReader(vismaXmlPath))
            let personList = Array.isArray(xml.personsXML.person) ? xml.personsXML.person : [xml.personsXML.person]
            let persons = []

            for (let person_i = 0; person_i < personList.length; person_i++) {
                const xmlPerson = personList[person_i];
                const xmlPositions = xmlPerson.employments.employment.positions

                let positions = []
                let xmlPosition = Object.keys(xmlPositions).length === 0 ? [] : (Array.isArray(xmlPositions.position) ? xmlPositions.position : [xmlPositions.position])
                for (let position_i = 0; position_i < xmlPosition.length; position_i++) {
                    const position = xmlPosition[position_i];

                    if (isExpired(position) || isMissingChart(position)) {
                        continue
                    }

                    let positionCode = position.positionInfo.positionCode

                    positions.push({
                        organisationId: position.chart._attributes.id,
                        unitId: position.chart.unit._attributes.id,
                        name: positionCode === undefined ? '' : positionCode._attributes.name,
                        startDate: new Date(position.positionStartDate._text),
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