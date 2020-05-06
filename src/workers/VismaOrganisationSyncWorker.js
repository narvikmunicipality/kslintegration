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
                        .input('organisationId', organisationId)
                        .query('SELECT InternalId,Name FROM Organisation WHERE ToDate IS NULL AND NewVersionId IS NULL AND OrganisationId=@OrganisationId')


                    //TODO: transactions
                    if (lookupResult.recordset.length === 0) {
                        const insertRequest = sqlserver.request()
                        await insertRequest
                            .input('organisationId', organisationId)
                            .input('name', position.unitName)
                            .query('INSERT INTO Organisation (OrganisationId,Name) VALUES (@organisationId,@name)')
                    } else if (lookupResult.recordset[0].Name !== position.unitName) {
                        const insertRequest = sqlserver.request()
                        let insertId = await insertRequest
                            .input('organisationId', organisationId)
                            .input('name', position.unitName)
                            .query('INSERT INTO Organisation (OrganisationId,Name) VALUES (@organisationId,@name);SELECT SCOPE_IDENTITY() AS InsertId')

                        const updateRequest = sqlserver.request()
                        await updateRequest
                            .input('name', position.unitName)
                            .input('newInternalId', insertId.recordset[0].InsertId.toString())
                            .input('oldInternalId', lookupResult.recordset[0].InternalId.toString())
                            .query('UPDATE Organisation SET ToDate=GETDATE(),NewVersionId=@newInternalId WHERE InternalId=@oldInternalId')
                    }
                }
            }
        }
    }
}

module.exports = VismaOrganisationSyncWorker