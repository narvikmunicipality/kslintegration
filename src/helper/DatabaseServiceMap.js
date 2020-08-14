function DatabaseServiceMap() {
    return {
        Organisation: { OrganisationId: 'id', Name: 'name', ParentId: 'parent' },
        Person: { SocialSecurityNumber: 'national_id', FirstName: 'first_name', LastName: 'last_name', Email: 'email' },
        EmployeePosition: { OrganisationId: 'org_id', SocialSecurityNumber: 'national_id', JobTitle: 'position_name', "PrimaryPosition:bool": 'main', "ManagerPosition:bool": 'manager' },
    }
}

module.exports = DatabaseServiceMap