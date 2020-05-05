function VismaXmlDataSource(vismaXmlPath, fileReader, parseXml) {
    function isExpired(position) {
        return position.positionEndDate && new Date(position.positionEndDate._text) <= new Date()
    }

    function isMissingChart(position) {
        return position.chart === undefined
    }

    function isMissingDimension2(position) {
        return position.costCentres === undefined || position.costCentres.dimension2 === undefined
    }

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
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

                    if (isExpired(position) || isMissingChart(position) || isMissingDimension2(position)) {
                        continue
                    }

                    let positionCode = position.positionInfo.positionCode

                    positions.push({
                        organisationId: position.chart._attributes.id,
                        unitId: position.costCentres.dimension2._attributes.value.replace(/^0*/g, ''),
                        unitName: capitalize(position.costCentres.dimension2._attributes.name.toLowerCase()),
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