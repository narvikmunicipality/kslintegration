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

    for (const { testName, personsIndex, familyName } of [
        { testName: 'First person has correct familyName', personsIndex: 0, familyName: 'Nordmann' },
        { testName: 'Second person has correct familyName', personsIndex: 1, familyName: 'Sørmann' }
    ]) {
        it(testName, async () => {
            expect((await source.getPersons())[personsIndex].familyName).toEqual(familyName)
        })
    }

    for (const { testName, personsIndex, givenName: givenName } of [
        { testName: 'First person has correct givenName', personsIndex: 0, givenName: 'Ola' },
        { testName: 'Second person has correct givenName', personsIndex: 1, givenName: 'Kari' }
    ]) {
        it(testName, async () => {
            expect((await source.getPersons())[personsIndex].givenName).toEqual(givenName)
        })
    }

    for (const { testName, personsIndex, ssn: ssn } of [
        { testName: 'First person has correct ssn', personsIndex: 0, ssn: '01020304050' },
        { testName: 'Second person has correct ssn', personsIndex: 1, ssn: '05040302010' }
    ]) {
        it(testName, async () => {
            expect((await source.getPersons())[personsIndex].ssn).toEqual(ssn)
        })
    }    
})