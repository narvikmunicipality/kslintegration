describe('VismaDatabaseSpecification', () => {
    const VismaDatabaseSpecification = require('../../src/helper/VismaDatabaseSpecification')
    let spec

    beforeEach(() => {
        spec = new VismaDatabaseSpecification()
    })

    it('has correct specification for Organisation table', () => {
        expect(spec.Organisation).toEqual({ tablename: 'Organisation', columns: ['OrganisationId', 'Name', 'ParentId'], id_columns: ['OrganisationId'], value_columns: ['Name', 'ParentId'] })
    })

    it('has correct specification for Person table', () => {
        expect(spec.Person).toEqual({ tablename: 'Person', columns: ['SocialSecurityNumber', 'FirstName', 'LastName', 'Email'], id_columns: ['SocialSecurityNumber'], value_columns: ['FirstName', 'LastName', 'Email'] })
    })

    it('has correct specification for EmployeePosition table', () => {
        expect(spec.EmployeePosition).toEqual({ tablename: 'EmployeePosition', columns: ['OrganisationId', 'SocialSecurityNumber', 'JobTitle', 'PrimaryPosition', 'ManagerPosition'], id_columns: ['OrganisationId', 'SocialSecurityNumber'], value_columns: ['JobTitle', 'PrimaryPosition', 'ManagerPosition'] })
    })
})