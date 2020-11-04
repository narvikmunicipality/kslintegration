/**
 * parentId-attribute points to an unit-tag's kode-attribute.
 * parentId equal to 0 means it's a root node.
 * 
*/
async function VismaOrganisationXmlConverter(parseXml, organisationXml) {
    function convertXmlToArray(xml) {
        let unitList = Array.isArray(xml.charts.chart.units.unit) ? xml.charts.chart.units.unit : [xml.charts.chart.units.unit]
        let units = []

        for (let unit_i = 0; unit_i < unitList.length; unit_i++) {
            const unit = unitList[unit_i];
            const managerId = unit.manager && unit.manager._attributes.id || ''
            units.push({ chartId: xml.charts.chart._attributes.id, unitId: unit._attributes.id, name: unit._attributes.name, parentId: unit._attributes.parentid, managerId: managerId, parentCode: unit._attributes.kode });
        }

        return units
    }

    let xml = await parseXml(await organisationXml)
    let rawUnitList = convertXmlToArray(xml);

    for (let unit_i = 0; unit_i < rawUnitList.length; unit_i++) {
        const unit = rawUnitList[unit_i];
        if (unit.parentId === '0') {
            unit.parentId = 'root'
        } else {
            unit.parentId = rawUnitList.filter(x => x.parentCode == unit.parentId)[0].unitId
        }
    }

    for (let unit_i = 0; unit_i < rawUnitList.length; unit_i++) {
        const unit = rawUnitList[unit_i];
        delete unit.parentCode
    }

    // Add the main root node to which all other 'root' nodes has as parent; ie. where parentId is equal to '0'.
    rawUnitList.push({ chartId: xml.charts.chart._attributes.id, unitId: 'root', name: xml.charts.chart._attributes.name, parentId: '', managerId: '' })

    return rawUnitList
}

module.exports = VismaOrganisationXmlConverter