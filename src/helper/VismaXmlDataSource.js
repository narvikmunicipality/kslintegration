function VismaXmlDataSource(log, vismaXml, parseXml) {
    function isExpired(position) {
        return position.positionEndDate && new Date(position.positionEndDate._text) <= new Date()
    }

    function isMissingChart(position) {
        return position.chart === undefined
    }

    function isMissingDimension2(position) {
        return position.costCentres === undefined || position.costCentres.dimension2 === undefined
    }

    function isMissingUnit(position) {
        return position.chart.unit === undefined
    }

    function getUnitIdFromChartsUnitOrCostcentreDimension(position) {
        const chartUnitIdExists = position.chart.unit && position.chart.unit._attributes;
        return chartUnitIdExists ? position.chart.unit._attributes.id : position.costCentres.dimension2._attributes.value.replace(/^0*/g, '');
    }

    return {
        getPersons: async () => {
            let xml = await parseXml(await vismaXml)
            let personList = Array.isArray(xml.personsXML.person) ? xml.personsXML.person : [xml.personsXML.person]
            let persons = []

            for (let person_i = 0; person_i < personList.length; person_i++) {
                const xmlPerson = personList[person_i];
                const xmlPositions = xmlPerson.employments.employment.positions

                let positions = []
                let xmlPosition = Object.keys(xmlPositions).length === 0 ? [] : (Array.isArray(xmlPositions.position) ? xmlPositions.position : [xmlPositions.position])
                for (let position_i = 0; position_i < xmlPosition.length; position_i++) {
                    const position = xmlPosition[position_i];

                    if (isExpired(position) || isMissingChart(position) || isMissingUnit(position) && isMissingDimension2(position)) {
                        continue
                    }

                    const positionCode = position.positionInfo.positionCode
                    const positionType = position.positionInfo.positionType
                    const unitId = getUnitIdFromChartsUnitOrCostcentreDimension(position)
                    const organisationId = position.chart._attributes.id;

                    let matchingUnit = positions.filter(x => x.unitId === unitId && x.organisationId === organisationId)
                    if (matchingUnit.length > 0 && !matchingUnit[0].isPrimaryPosition) {
                        positions = positions.filter(x => !(x.unitId === unitId && x.organisationId === organisationId))
                        matchingUnit = []
                    }
                    if (matchingUnit.length === 0) {
                        try {
                            positions.push({
                                organisationId: organisationId,
                                unitId: unitId,
                                name: positionCode === undefined ? positionType._attributes.name : positionCode._attributes.name,
                                startDate: new Date(position.positionStartDate && position.positionStartDate._text || position._attributes.validFromDate),
                                isPrimaryPosition: position._attributes.isPrimaryPosition == 'true',
                            })
                        }
                        catch (e) {
                            log.error(JSON.stringify(xmlPerson))
                            throw e
                        }
                    }
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