function DataRangeRetriever(spec, map, sqlserver) {
    function formatDate(date) {
        return date.toISOString().slice(0, -5) + 'Z'
    }

    function mapRecordToItem(item, record) {
        function isBooleanValue(key) { return map[`${key}:bool`] }

        for (const key of spec.columns) {
            if (isBooleanValue(key)) {
                item[map[`${key}:bool`]] = record[key] === 'true'
            } else {
                item[map[key]] = record[key]
            }
        }
    }

    return {
        get: async (fromDate, toDate) => {
            let items = []

            // If no fromDate → toDate was given, everything is returned.
            if (!(fromDate && toDate)) {
                let result = await sqlserver.request().query(`SELECT ${spec.columns.join(',')} FROM ${spec.tablename} WHERE FromDate < GETDATE() AND ToDate IS NULL`)

                for (let record_i = 0; record_i < result.recordset.length; record_i++) {
                    let item = { changeType: 'add', changeDate: formatDate(new Date()), newRecord: {} }
                    const record = result.recordset[record_i]

                    mapRecordToItem(item.newRecord, record)
                    items.push(item)
                }
            } else {
                // Retrieve id's for every item that has been deleted in the given period.
                let deletedResult = await sqlserver.request()
                    .input('fromDate', new Date(fromDate).toISOString())
                    .input('toDate', new Date(toDate).toISOString())
                    .query(`SELECT ${spec.id_columns.join(',')} FROM ${spec.tablename} WHERE ToDate >= Convert(datetime,@fromDate) AND ToDate < Convert(datetime,@toDate) AND NewVersionId IS NULL`)

                // Retrieve full item for old record within given period.
                for (let result_i = 0; result_i < deletedResult.recordset.length; result_i++) {
                    const item = deletedResult.recordset[result_i]

                    let deletedItemsRequest = await sqlserver.request()
                        .input('fromDate', new Date(fromDate).toISOString())
                        .input('toDate', new Date(toDate).toISOString())

                    for (const idcolumn of spec.id_columns) {
                        deletedItemsRequest.input(idcolumn, item[idcolumn])
                    }

                    let deletedItems = await deletedItemsRequest.query(`SELECT ${spec.columns.join(',')},FromDate,ToDate FROM (SELECT ROW_NUMBER() OVER (ORDER BY InternalId) AS RowNumber, COUNT(*) OVER () AS Total,* FROM ${spec.tablename} WHERE ((FromDate >= Convert(datetime,@fromDate) AND FromDate < Convert(datetime,@toDate)) OR (ToDate > Convert(datetime,@fromDate) AND ToDate < Convert(datetime,@toDate))) AND ${spec.id_columns.map(x => `${x}=@${x}`).join(' AND ')}) a WHERE (RowNumber=1 AND FromDate <= Convert(datetime,@fromDate)) OR RowNumber=Total`)

                    if (new Date(deletedItems.recordset[0].FromDate) <= new Date(fromDate)) {
                        let mappedDeletedItem = { changeType: 'delete', changeDate: formatDate(new Date(deletedItems.recordset[0].ToDate)), oldRecord: {} }
                        mapRecordToItem(mappedDeletedItem.oldRecord, deletedItems.recordset[0])
                        items.push(mappedDeletedItem)
                    }
                }

                // Retrieve id's for every item that has been changed in the given period.
                let changedResult = await sqlserver.request()
                    .input('fromDate', new Date(fromDate).toISOString())
                    .input('toDate', new Date(toDate).toISOString())
                    .query(`SELECT ${spec.id_columns.join(',')} FROM ${spec.tablename} a WHERE a.FromDate >= Convert(datetime,@fromDate) AND a.FromDate < Convert(datetime,@toDate) AND ((a.ToDate IS NULL AND a.NewVersionId IS NULL) OR Convert(datetime,@toDate) < (SELECT b.FromDate FROM ${spec.tablename} b WHERE a.NewVersionId = b.InternalId))`)

                // Retrieve full item for old and new record within given period.
                for (let result_i = 0; result_i < changedResult.recordset.length; result_i++) {
                    const item = changedResult.recordset[result_i]

                    let changedItemsRequest = await sqlserver.request()
                        .input('fromDate', new Date(fromDate).toISOString())
                        .input('toDate', new Date(toDate).toISOString())

                    for (const idcolumn of spec.id_columns) {
                        changedItemsRequest.input(idcolumn, item[idcolumn])
                    }

                    let changedItems = await changedItemsRequest.query(`SELECT ${spec.columns.join(',')},FromDate,ToDate FROM (SELECT ROW_NUMBER() OVER (ORDER BY InternalId) AS RowNumber, COUNT(*) OVER () AS Total,* FROM ${spec.tablename} WHERE ((FromDate >= Convert(datetime,@fromDate) AND FromDate < Convert(datetime,@toDate)) OR (ToDate > Convert(datetime,@fromDate) AND ToDate < Convert(datetime,@toDate))) AND ${spec.id_columns.map(x => `${x}=@${x}`).join(' AND ')}) a WHERE (RowNumber=1 AND FromDate <= Convert(datetime,@fromDate)) OR RowNumber=Total`)

                    let mappedChangedItem
                    if (changedItems.recordset.length === 1) {
                        mappedChangedItem = { changeType: 'add', changeDate: formatDate(new Date(changedItems.recordset[0].FromDate)), newRecord: {} }
                        mapRecordToItem(mappedChangedItem.newRecord, changedItems.recordset[0])
                    } else {
                        mappedChangedItem = { changeType: 'modify', changeDate: formatDate(new Date(changedItems.recordset[1].FromDate)), oldRecord: {}, newRecord: {} }                        
                        mapRecordToItem(mappedChangedItem.oldRecord, changedItems.recordset[0])
                        mapRecordToItem(mappedChangedItem.newRecord, changedItems.recordset[1])
                    }
                    items.push(mappedChangedItem)
                }
            }

            return items.map(x => JSON.stringify(x)).join('\n')
        }
    }
}

module.exports = DataRangeRetriever