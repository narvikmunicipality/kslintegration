function VismaOrganisationSyncWorker(log, sqlserver, vismaDataSource) {
    log.debug('VismaOrganisationSyncWorker created.')

    return {
        name: 'VismaOrganisationSyncWorker',
        run: async () => {
            const persons = await vismaDataSource.getPersons();

            for (let person_i = 0; person_i < persons.length; person_i++) {
                const person = persons[person_i]
                for (let position_i = 0; position_i < person.positions.length; position_i++) {
                    const position = person.positions[position_i];
                    const organisationId = position.organisationId + '-' + position.unitId;

                    const lookupResult = await sqlserver.request()
                        .input('name', position.unitName)
                        .input('organisationId', organisationId)
                        .query('SELECT COUNT(InternalId) AS Units FROM Organisation WHERE ToDate IS NULL AND NewVersionId IS NULL AND OrganisationId=@OrganisationId AND Name=@name')

                    if (lookupResult.recordset[0].Units === 0) {
                        const insertRequest = sqlserver.request()
                        await insertRequest.
                            input('organisationId', organisationId).
                            input('name', position.unitName).
                            query('INSERT INTO Organisation (OrganisationId,Name) VALUES (@organisationId,@name)')
                    }
                }
            }
        }
    }
}

module.exports = VismaOrganisationSyncWorker