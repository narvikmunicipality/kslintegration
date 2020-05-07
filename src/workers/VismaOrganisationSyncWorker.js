function VismaOrganisationSyncWorker(log, sqlserver, vismaDataSource) {
    log.debug('VismaOrganisationSyncWorker created.')

    function noMatchingItemsFound(lookupResult) {
        return lookupResult.recordset.length === 0
    }

    function foundItemHasUpdatedValues(lookupResult, position) {
        return lookupResult.recordset[0].Name !== position.unitName
    }

    async function lookupExistingItemWithId(sqlserver, organisationId) {
        return await sqlserver.request()
            .input('organisationId', organisationId)
            .query('SELECT InternalId,Name FROM Organisation WHERE ToDate IS NULL AND NewVersionId IS NULL AND OrganisationId=@OrganisationId')
    }

    async function insertNewItem(sqlserver, organisationId, position) {
        await sqlserver.request()
            .input('organisationId', organisationId)
            .input('name', position.unitName)
            .query('INSERT INTO Organisation (OrganisationId,Name) VALUES (@organisationId,@name)')
    }

    async function insertNewItemAndGetInsertId(sqlserver, organisationId, position) {
        let insertId = await sqlserver.request()
            .input('organisationId', organisationId)
            .input('name', position.unitName)
            .query('INSERT INTO Organisation (OrganisationId,Name) VALUES (@organisationId,@name);SELECT SCOPE_IDENTITY() AS InsertId')
        return insertId
    }

    async function updatePreviousItemAndPointToNewItem(sqlserver, position, insertId, lookupResult) {
        await sqlserver.request()
            .input('name', position.unitName)
            .input('newInternalId', insertId.recordset[0].InsertId.toString())
            .input('oldInternalId', lookupResult.recordset[0].InternalId.toString())
            .query('UPDATE Organisation SET ToDate=GETDATE(),NewVersionId=@newInternalId WHERE InternalId=@oldInternalId')
    }

    return {
        name: 'VismaOrganisationSyncWorker',
        run: async () => {
            const persons = await vismaDataSource.getPersons()
            let activeIds = []

            for (let person_i = 0; person_i < persons.length; person_i++) {
                const person = persons[person_i]
                for (let position_i = 0; position_i < person.positions.length; position_i++) {
                    const position = person.positions[position_i]
                    const organisationId = position.organisationId + '-' + position.unitId
                    activeIds.push(organisationId)

                    const lookupResult = await lookupExistingItemWithId(sqlserver, organisationId)

                    //TODO: transactions
                    if (noMatchingItemsFound(lookupResult)) {
                        await insertNewItem(sqlserver, organisationId, position)
                    } else if (foundItemHasUpdatedValues(lookupResult, position)) {
                        let insertId = await insertNewItemAndGetInsertId(sqlserver, organisationId, position)
                        await updatePreviousItemAndPointToNewItem(sqlserver, position, insertId, lookupResult)
                    }
                }
            }

            let existingResult = await sqlserver.request()
                .query('SELECT InternalId,OrganisationId FROM Organisation WHERE ToDate IS NULL AND NewVersionId IS NULL')
            
            let idsInDatabase = []
            for (let existing_i = 0; existing_i < existingResult.recordset.length; existing_i++) {
                const item = existingResult.recordset[existing_i];
                idsInDatabase.push({ InternalId: item.InternalId, OrganisationId: item.OrganisationId})
            }

            let expiredIds = []
            for (let database_i = 0; database_i < idsInDatabase.length; database_i++) {
                const item = idsInDatabase[database_i];
                if (!activeIds.includes(item.OrganisationId)) {
                    expiredIds.push(item.InternalId)
                }
            }

            for (let expired_i = 0; expired_i < expiredIds.length; expired_i++) {
                const expiredId = expiredIds[expired_i]
                await sqlserver.request()
                        .input('internalId', expiredId)
                        .query('UPDATE Organisation SET ToDate=GETDATE() WHERE InternalId=@internalId')
            }
        }
    }
}

module.exports = VismaOrganisationSyncWorker