function DatabaseServiceMap() {
    return {
        Organisation: { OrganisationId: 'id', Name: 'name' },
        Person: { SocialSecurityNumber: 'national_id', FirstName: 'first_name', LastName: 'last_name', Email: 'email' },
        EmployeePosition: { OrganisationId: 'org_id', SocialSecurityNumber: 'national_id', JobTitle: 'position_name', PrimaryPosition: 'main' },
    }
}

module.exports = DatabaseServiceMap