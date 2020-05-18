function DataRangeRetriever(spec, map, sqlserver) {
    function formatDate(date) {
        return date.toISOString().slice(0, -5) + 'Z'
    }

    function mapRecordToItem(item, record) {
        for (const key of spec.columns) {
            item[map[key]] = record[key]
        }
    }

    return {
        get: async (fromDate, toDate) => {
            let items = []

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
                let result = await sqlserver.request()
                    .input('fromDate', new Date(fromDate).toISOString())
                    .input('toDate', new Date(toDate).toISOString())
                    .query(`SELECT ${spec.id_columns.join(',')} FROM ${spec.tablename} WHERE FromDate >= Convert(datetime,@fromDate) AND ToDate < Convert(datetime,@toDate) AND NewVersionId IS NULL`)

                // Retrieve full item for old and new record within given period.
                for (let result_i = 0; result_i < result.recordset.length; result_i++) {
                    const item = result.recordset[result_i]

                    let deletedItemsRequest = await sqlserver.request()
                        .input('fromDate', new Date(fromDate).toISOString())
                        .input('toDate', new Date(toDate).toISOString())

                    for (const idcolumn of spec.id_columns) {
                        deletedItemsRequest.input(idcolumn, item[idcolumn])
                    }

                    let deletedItems = await deletedItemsRequest.query(`SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY InternalId) AS RowNumber, COUNT(*) OVER () AS Total,* FROM dbo.Test WHERE ((FromDate >= Convert(datetime,@fromDate) AND FromDate < Convert(datetime,@toDate)) OR (ToDate > Convert(datetime,@fromDate) AND ToDate < Convert(datetime,@toDate))) AND ${spec.id_columns.map(x => `${x}=@${x}`).join(' AND ')}) a WHERE RowNumber=1 OR RowNumber=Total`)

                    if (new Date(deletedItems.recordset[0].FromDate) <= new Date(fromDate)) {
                        let mappedDeletedItem = { changeType: 'modify', changeDate: formatDate(new Date()), oldRecord: {}, newRecord: {} }
                        mapRecordToItem(mappedDeletedItem.oldRecord, deletedItems.recordset[0])
                        mapRecordToItem(mappedDeletedItem.newRecord, deletedItems.recordset[1])
                        items.push(mappedDeletedItem)
                    }
                }
            }

            return items.map(x => JSON.stringify(x)).join('\n')
        }
    }
}

module.exports = DataRangeRetriever