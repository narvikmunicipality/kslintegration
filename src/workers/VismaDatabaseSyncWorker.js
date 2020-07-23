function VismaDatabaseSyncWorker(log, sqlserver, vismaDataSource, dbSpec, extractor) {
    log.debug('VismaDatabaseSyncWorker created.')

    function noMatchingItemsFound(lookupResult) {
        return lookupResult.recordset.length === 0
    }

    function foundItemHasUpdatedValues(lookupResult, idValueMap) {
        let hasUpdatedValues = false

        for (let i = 0; i < dbSpec.value_columns.length; i++) {
            const key = dbSpec.value_columns[i];

            if (lookupResult.recordset[0][key].toString() !== idValueMap[key].toString()) {
                hasUpdatedValues = true
                break
            }
        }

        return hasUpdatedValues
    }

    async function lookupExistingItemWithId(sqlserver, idValueMap) {
        let request = sqlserver.request()
        for (const [columnName, value] of Object.entries(idValueMap).filter(kv => dbSpec.id_columns.includes(kv[0]))) {
            request.input(columnName, value.toString())
        }
        return await request.query(`SELECT InternalId,${dbSpec.value_columns.join(',')} FROM ${dbSpec.tablename} WHERE ToDate IS NULL AND NewVersionId IS NULL AND ${dbSpec.id_columns.map(x => `${x}=@${x}`).join(' AND ')}`)
    }

    async function insertNewItem(sqlserver, idValueMap, returnInsertId) {
        let request = sqlserver.request()

        for (const [columnName, value] of Object.entries(idValueMap)) {
            request.input(columnName, value.toString())
        }

        return await request.query(`INSERT INTO ${dbSpec.tablename} (${dbSpec.columns.join(',')}) VALUES (${dbSpec.columns.map(x => '@' + x).join(',')})${returnInsertId ? ';SELECT SCOPE_IDENTITY() AS InsertId' : ''}`)
    }

    async function updatePreviousItemAndPointToNewItem(sqlserver, insertId, lookupResult) {
        await sqlserver.request()
            .input('newInternalId', insertId.recordset[0].InsertId.toString())
            .input('oldInternalId', lookupResult.recordset[0].InternalId.toString())
            .query(`UPDATE ${dbSpec.tablename} SET ToDate=GETDATE(),NewVersionId=@newInternalId WHERE InternalId=@oldInternalId`)
    }

    async function retrieveExistingItemsFromDatabase(sqlserver) {
        let existingResult = await sqlserver.request()
            .query(`SELECT InternalId,${dbSpec.id_columns.join(',')} FROM ${dbSpec.tablename} WHERE ToDate IS NULL AND NewVersionId IS NULL`)
        let idsInDatabase = []
        for (let existing_i = 0; existing_i < existingResult.recordset.length; existing_i++) {
            const item = existingResult.recordset[existing_i]
            idsInDatabase.push(item)
        }
        return idsInDatabase
    }

    function filterDatabaseItemsMissingFromSync(idsInDatabase, activeIds) {
        function itemsEqual(item1, item2) {
            for (const column of dbSpec.id_columns) {
                if (item1[column] !== item2[column]) {
                    return false
                }
            }
            return true
        }

        let expiredIds = []
        for (let database_i = 0; database_i < idsInDatabase.length; database_i++) {
            const item = idsInDatabase[database_i]
            let isExpired = true

            for (let active_i = 0; active_i < activeIds.length; active_i++) {
                const active = activeIds[active_i];

                if (itemsEqual(item, active)) {
                    isExpired = false
                    break
                }

            }

            if (isExpired) {
                expiredIds.push(item.InternalId)
            }
        }
        return expiredIds
    }

    async function expireItemsInDatabase(activeIds, sqlserver) {
        let idsInDatabase = await retrieveExistingItemsFromDatabase(sqlserver)
        let expiredIds = filterDatabaseItemsMissingFromSync(idsInDatabase, activeIds)

        for (let expired_i = 0; expired_i < expiredIds.length; expired_i++) {
            const expiredId = expiredIds[expired_i]
            await sqlserver.request()
                .input('internalId', expiredId)
                .query(`UPDATE ${dbSpec.tablename} SET ToDate=GETDATE() WHERE InternalId=@internalId`)
        }
    }

    return {
        name: 'VismaDatabaseSyncWorker',
        run: async () => {
            const persons = await vismaDataSource.getPersons()
            let activeIds = []

            for (let person_i = 0; person_i < persons.length; person_i++) {
                const person = persons[person_i]
                for (let position_i = 0; position_i < person.positions.length; position_i++) {
                    let idValueMap = await extractor.createMap(person, position_i)
                    activeIds.push(idValueMap)

                    const lookupResult = await lookupExistingItemWithId(sqlserver, idValueMap)

                    //TODO: transactions
                    if (noMatchingItemsFound(lookupResult)) {
                        await insertNewItem(sqlserver, idValueMap)
                    } else if (foundItemHasUpdatedValues(lookupResult, idValueMap)) {
                        let insertId = await insertNewItem(sqlserver, idValueMap, true)
                        await updatePreviousItemAndPointToNewItem(sqlserver, insertId, lookupResult)
                    }
                }
            }

            await expireItemsInDatabase(activeIds, sqlserver)
        }
    }
}

module.exports = VismaDatabaseSyncWorker