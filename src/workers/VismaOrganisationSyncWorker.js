function VismaOrganisationSyncWorker(log, sqlserver, vismaDataSource) {
    log.debug('VismaOrganisationSyncWorker created.')

    return {
        run: async () => {
            const persons = await vismaDataSource.getPersons();
            
            for (let person_i = 0; person_i < persons.length; person_i++) {
                const request = sqlserver.request()
                const person = persons[person_i]
                for (let position_i = 0; position_i < person.positions.length; position_i++) {
                    const position = person.positions[position_i];

                    request.
                        input('organisationId', position.organisationId + '-' + position.unitId).
                        input('name', position.unitName).
                        query('INSERT INTO Organisation (OrganisationId,Name) VALUES (@organisationId,@name)')
                }
            }
        }
    }
}

module.exports = VismaOrganisationSyncWorker