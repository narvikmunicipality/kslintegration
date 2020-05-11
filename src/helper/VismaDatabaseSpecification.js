function VismaDatabaseSpecification() {
     return {
         Organisation: { tablename: 'Organisation', columns: ['OrganisationId', 'Name'], id_columns: ['OrganisationId'], value_columns: ['Name'] },
         Person: { tablename: 'Person', columns: ['SocialSecurityNumber', 'FirstName', 'LastName', 'Email'], id_columns: ['SocialSecurityNumber'], value_columns: ['FirstName', 'LastName', 'Email'] },
         EmployeePosition: { tablename: 'EmployeePosition', columns: ['OrganisationId', 'SocialSecurityNumber', 'JobTitle', 'PrimaryPosition'], id_columns: ['OrganisationId', 'SocialSecurityNumber'], value_columns: ['JobTitle', 'PrimaryPosition'] },
     }
}

module.exports = VismaDatabaseSpecification