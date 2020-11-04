describe('VismaOrganisationXmlConverter', () => {
    const VismaOrganisationXmlConverter = require('../../src/helper/VismaOrganisationXmlConverter')
    const xml2js = xml => require('xml-js').xml2js(xml, { compact: true })

    const ORGANISATION_XML_WITH_ONE_NO_PARENT_UNIT = '<charts xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://grid:8090/hrm_ws/schemas/organization/organization-chart.xsd"><chart id="10" name="Navn kommune"><units><unit id="1" kode="3" name="Enhetsnavn" parentid="0"><manager id="4"/></unit></units></chart></charts>'
    const ORGANISATION_XML_WITH_ONE_NO_MANAGER_UNIT = '<charts xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://grid:8090/hrm_ws/schemas/organization/organization-chart.xsd"><chart id="10" name="Navn kommune"><units><unit id="1" kode="3" name="Enhetsnavn" parentid="0"></unit></units></chart></charts>'
    const ORGANISATION_XML_WITH_MULTIPLE_UNITS = '<charts xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://grid:8090/hrm_ws/schemas/organization/organization-chart.xsd"><chart id="10" name="Navn kommune"><units><unit id="1" kode="3" name="Enhetsnavn 1" parentid="0"><manager id="4"/></unit><unit id="5" kode="6" name="Enhetsnavn 2" parentid="0"><manager id="7"/></unit></units></chart></charts>'
    const ORGANISATION_XML_UNIT_WITH_PARENT = '<charts xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://grid:8090/hrm_ws/schemas/organization/organization-chart.xsd"><chart id="10" name="Navn kommune"><units><unit id="1" kode="3" name="Enhetsnavn 1" parentid="0"><manager id="4"/></unit><unit id="5" kode="6" name="Enhetsnavn 2" parentid="3"><manager id="7"/></unit></units></chart></charts>'

    it('converts XML to correctly mapped array for unit without parent', async () => {
        let result = await VismaOrganisationXmlConverter(xml2js, Promise.resolve(ORGANISATION_XML_WITH_ONE_NO_PARENT_UNIT))
        expect(result).toEqual([{ chartId: '10', unitId: '1', name: 'Enhetsnavn', parentId: 'root', managerId: '4' }, { chartId: '10', unitId: 'root', name: 'Navn kommune', parentId: '', managerId: '' }])
    })

    it('converts XML to correctly mapped array for unit without manager', async () => {
        let result = await VismaOrganisationXmlConverter(xml2js, Promise.resolve(ORGANISATION_XML_WITH_ONE_NO_MANAGER_UNIT))
        expect(result).toEqual([{ chartId: '10', unitId: '1', name: 'Enhetsnavn', parentId: 'root', managerId: '' },{ chartId: '10', unitId: 'root', name: 'Navn kommune', parentId: '', managerId: '' }])
    })

    it('converts XML to correctly mapped array for multiple units', async () => {
        let result = await VismaOrganisationXmlConverter(xml2js, Promise.resolve(ORGANISATION_XML_WITH_MULTIPLE_UNITS))
        expect(result).toEqual([{ chartId: '10', unitId: '1', name: 'Enhetsnavn 1', parentId: 'root', managerId: '4' }, { chartId: '10', unitId: '5', name: 'Enhetsnavn 2', parentId: 'root', managerId: '7' },{ chartId: '10', unitId: 'root', name: 'Navn kommune', parentId: '', managerId: '' }])
    })

    it('maps parent id to correct unit id', async () => {
        let result = await VismaOrganisationXmlConverter(xml2js, Promise.resolve(ORGANISATION_XML_UNIT_WITH_PARENT))
        expect(result).toEqual([{ chartId: '10', unitId: '1', name: 'Enhetsnavn 1', parentId: 'root', managerId: '4' }, { chartId: '10', unitId: '5', name: 'Enhetsnavn 2', parentId: '1', managerId: '7' },{ chartId: '10', unitId: 'root', name: 'Navn kommune', parentId: '', managerId: '' }])
    })
})