describe('VismaXmlDataSource', () => {
    const VismaXmlDataSource = require('../../src/helper/VismaXmlDataSource')
    const fsfread = require('util').promisify(require('fs').readFile)
    const xml2js = xml => require('xml-js').xml2js(xml, { compact: true })

    var source

    beforeEach(() => {
        source = new VismaXmlDataSource('spec/testdata/visma.xml', fsfread, xml2js)
    })

    for (const { testName, personsIndex, employeeId } of [
        { testName: 'First person has correct employeeId', personsIndex: 0, employeeId: '11' },
        { testName: 'Second person has correct employeeId', personsIndex: 1, employeeId: '12' }
    ]) {
        it(testName, async () => {
            expect((await source.getPersons())[personsIndex].employeeId).toEqual(employeeId)
        })
    }
})