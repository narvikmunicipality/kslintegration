describe('DatabaseServiceMap', () => {
    const DatabaseServiceMap = require('../../src/helper/DatabaseServiceMap')
    let spec

    beforeEach(() => {
        spec = new DatabaseServiceMap()
    })

    it('has correct mapping for Organisation columns', () => {
        expect(spec.Organisation).toEqual({ OrganisationId: 'id', Name: 'name', ParentId: 'parent' })
    })

    it('has correct mapping for Person columns', () => {
        expect(spec.Person).toEqual({ SocialSecurityNumber: 'national_id', FirstName: 'first_name', LastName: 'last_name', Email: 'email' })
    })

    it('has correct mapping for EmployeePosition columns', () => {
        expect(spec.EmployeePosition).toEqual({ OrganisationId: 'org_id', SocialSecurityNumber: 'national_id', JobTitle: 'position_name', "PrimaryPosition:bool": 'main', "ManagerPosition:bool": 'manager' })
    })
})