function VismaDatabaseSpecification() {
    return {
        Organisation: {
            tablename: 'Organisation',
            columns: ['OrganisationId', 'Name', 'ParentId'],
            id_columns: ['OrganisationId'],
            value_columns: ['Name', 'ParentId']
        },
        Person: {
            tablename: 'Person',
            columns: ['SocialSecurityNumber', 'FirstName', 'LastName', 'Email'],
            id_columns: ['SocialSecurityNumber'],
            value_columns: ['FirstName', 'LastName', 'Email']
        },
        EmployeePosition: {
            tablename: 'EmployeePosition',
            columns: ['OrganisationId', 'SocialSecurityNumber', 'JobTitle', 'PrimaryPosition', 'ManagerPosition'],
            id_columns: ['OrganisationId', 'SocialSecurityNumber'],
            value_columns: ['JobTitle', 'PrimaryPosition', 'ManagerPosition']
        },
    }
}

module.exports = VismaDatabaseSpecification