async function VismaOrganisationXmlConverter(parseXml, organisationXml) {
    function convertXmlToArray(xml) {
        let unitList = Array.isArray(xml.charts.chart.units.unit) ? xml.charts.chart.units.unit : [xml.charts.chart.units.unit]
        let units = []

        for (let unit_i = 0; unit_i < unitList.length; unit_i++) {
            const unit = unitList[unit_i];
            const managerId = unit.manager && unit.manager._attributes.id || ''
            units.push({ unitId: unit._attributes.id, name: unit._attributes.name, parentId: unit._attributes.parentid, managerId: managerId, parentCode: unit._attributes.kode });
        }

        return units
    }



    let parsedOrganisationXml = await parseXml(await organisationXml)
    let rawUnitList = convertXmlToArray(parsedOrganisationXml);

    for (let unit_i = 0; unit_i < rawUnitList.length; unit_i++) {
        const unit = rawUnitList[unit_i];
        if (unit.parentId === '0') {
            unit.parentId = ''
        } else {
            unit.parentId = rawUnitList.filter(x => x.parentCode == unit.parentId)[0].unitId
        }
    }

    for (let unit_i = 0; unit_i < rawUnitList.length; unit_i++) {
        const unit = rawUnitList[unit_i];
        delete unit.parentCode
    }

    return rawUnitList
}

module.exports = VismaOrganisationXmlConverter