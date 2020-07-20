describe('VismaDataExtractor', () => {
    const VismaDataExtractor = require('../../src/helper/VismaDataExtractor')
    const EMPLOYEE_WITH_TWO_POSITIONS = { familyName: 'FamilyName', givenName: 'GivenName', ssn: '01020304050', employeeId: '11', positions: [{ isManagerPosition: true, isPrimaryPosition: true, startDate: '2020-02-01', organisationId: '101', unitId: '1001', unitName: 'Enhetsnavn 1', name: 'Konsulent' }, { isManagerPosition: false, isPrimaryPosition: false, startDate: '2020-02-01', organisationId: '102', unitId: '1002', unitName: 'Enhetsnavn 2', name: 'Ingeniør' }] }
    const SSN_TO_MAIL_MAP = [{ ssn: '01020304050', mail: 'Mail1' }]
    let extractor

    beforeEach(() => {
        extractor = new VismaDataExtractor()
    })

    describe('extracts and maps values correctly for Organisation table', () => {
        it('for first position', () => {
            expect(extractor.Organisation.createMap(EMPLOYEE_WITH_TWO_POSITIONS, 0)).toEqual({ OrganisationId: '101-1001', Name: 'Enhetsnavn 1' })
        })

        it('for second position', () => {
            expect(extractor.Organisation.createMap(EMPLOYEE_WITH_TWO_POSITIONS, 1)).toEqual({ OrganisationId: '102-1002', Name: 'Enhetsnavn 2' })
        })
    })

    describe('extracts and maps values correctly for Person table', () => {
        it('for first position', () => {
            expect(extractor.Person(SSN_TO_MAIL_MAP).createMap(EMPLOYEE_WITH_TWO_POSITIONS, 0)).toEqual({ SocialSecurityNumber: '01020304050', FirstName: 'GivenName', LastName: 'FamilyName', EmployeeId: '11', Email: 'Mail1' })
        })

        it('for second position', () => {
            expect(extractor.Person(SSN_TO_MAIL_MAP).createMap(EMPLOYEE_WITH_TWO_POSITIONS, 1)).toEqual({ SocialSecurityNumber: '01020304050', FirstName: 'GivenName', LastName: 'FamilyName', EmployeeId: '11', Email: 'Mail1' })
        })

        it('sets dummy address when missing address', () => {
            expect(extractor.Person([]).createMap(EMPLOYEE_WITH_TWO_POSITIONS, 1)).toEqual({ SocialSecurityNumber: '01020304050', FirstName: 'GivenName', LastName: 'FamilyName', EmployeeId: '11', Email: 'har.ikke.e-post@example.com' })
        })

        it('sets dummy address when address is whitespace', () => {
            expect(extractor.Person([{ ssn: '01020304050', mail: ' ' }]).createMap(EMPLOYEE_WITH_TWO_POSITIONS, 1)).toEqual({ SocialSecurityNumber: '01020304050', FirstName: 'GivenName', LastName: 'FamilyName', EmployeeId: '11', Email: 'har.ikke.e-post@example.com' })
        })
    })

    describe('extracts and maps values correctly for EmployeePosition table', () => {
        it('for first position', () => {
            expect(extractor.EmployeePosition.createMap(EMPLOYEE_WITH_TWO_POSITIONS, 0)).toEqual({ OrganisationId: '101-1001', SocialSecurityNumber: '01020304050', JobTitle: 'Konsulent', PrimaryPosition: 'true', ManagerPosition: 'true' })
        })

        it('for second position', () => {
            expect(extractor.EmployeePosition.createMap(EMPLOYEE_WITH_TWO_POSITIONS, 1)).toEqual({ OrganisationId: '102-1002', SocialSecurityNumber: '01020304050', JobTitle: 'Ingeniør', PrimaryPosition: 'false', ManagerPosition: 'false' })
        })
    })
})