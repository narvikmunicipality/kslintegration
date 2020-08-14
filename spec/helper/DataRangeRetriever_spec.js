describe('DataRangeRetriever', () => {
    const sqlExpect = require('../test/RequestHelper')
    const DataRangeRetriever = require('../../src/helper/DataRangeRetriever')

    const SINGLE_MAPPING = { TestId: 'main_id', Value: 'content' }
    const MULTIPLE_MAPPING = { TestId1: 'primary_id', TestId2: 'secondary_id', Value1: 'vendor', Value2: 'model' }
    const SINGLE_SPEC = { tablename: 'TestSingle', columns: ['TestId', 'Value'], id_columns: ['TestId'], value_columns: ['Value'] }
    const MULTIPLE_SPEC = { tablename: 'TestMultiple', columns: ['TestId1', 'TestId2', 'Value1', 'Value2'], id_columns: ['TestId1', 'TestId2'], value_columns: ['Value1', 'Value2'] }
    const SINGLE_MAPPING_WITH_BOOLEAN_TYPE = { TestId: 'main_id', "Value:bool": 'switch' }
    const MULTIPLE_MAPPING_WITH_BOOLEAN_TYPE = { TestId1: 'primary_id', TestId2: 'secondary_id', "Value1:bool": 'switch1', "Value2:bool": 'switch2' }

    const EMPTY_SQL_RESULT = { recordset: [], output: {}, rowsAffected: [0] }
    const SINGLE_SPEC_SINGLE_ITEM_NO_DATES_SQL_RESULT = { recordset: [{ TestId: '1', Value: 'Test' }], output: {}, rowsAffected: [1] }
    const MULTIPLE_SPEC_SINGLE_ITEM_NO_DATES_SQL_RESULT = { recordset: [{ TestId1: '1', TestId2: '2', Value1: 'Test1', Value2: 'Test2' }], output: {}, rowsAffected: [1] }
    const SINGLE_SPEC_MULTIPLE_ITEM_NO_DATES_SQL_RESULT = { recordset: [{ TestId: '1', Value: 'Test1' }, { TestId: '2', Value: 'Test2' }], output: {}, rowsAffected: [2] }
    const MULTIPLE_SPEC_MULTIPLE_ITEM_NO_DATES_SQL_RESULT = { recordset: [{ TestId1: '1', TestId2: '2', Value1: 'Test1', Value2: 'Test2' }, { TestId1: '3', TestId2: '4', Value1: 'Test3', Value2: 'Test4' }], output: {}, rowsAffected: [2] }
    const SINGLE_SPEC_SINGLE_ITEM_NO_DATES_BOOLEAN_SQL_RESULT = { recordset: [{ TestId: '1', Value: 'false' }], output: {}, rowsAffected: [1] }
    const MULTIPLE_SPEC_SINGLE_ITEM_NO_DATES_BOOLEAN_SQL_RESULT = { recordset: [{ TestId1: '1', TestId2: '2', Value1: 'true', Value2: 'false' }], output: {}, rowsAffected: [1] }

    const SINGLE_SPEC_SINGLE_ID_ITEM_DATE_SQL_RESULT = { recordset: [{ TestId: '1' }], output: {}, rowsAffected: [1] }
    const MULTIPLE_SPEC_SINGLE_ID_ITEM_DATE_SQL_RESULT = { recordset: [{ TestId1: '1', TestId2: '2' }], output: {}, rowsAffected: [1] }
    const SINGLE_SPEC_MULTIPLE_ID_ITEM_DATE_SQL_RESULT = { recordset: [{ TestId: '1' }, { TestId: '2' }], output: {}, rowsAffected: [2] }
    const MULTIPLE_SPEC_MULTIPLE_ID_ITEM_DATE_SQL_RESULT = { recordset: [{ TestId1: '1', TestId2: '2' }, { TestId1: '3', TestId2: '4' }], output: {}, rowsAffected: [2] }
    const SINGLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1 = { recordset: [{ TestId: '1', Value: 'Test1', FromDate: '2020-05-12T00:00:00Z', ToDate: '2020-05-12T00:10:00Z' }, { TestId: '2', Value: 'Test2', FromDate: '2020-05-12T00:15:00Z' }], output: {}, rowsAffected: [2] }
    const MULTIPLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1 = { recordset: [{ TestId1: '1', TestId2: '2', Value1: 'Test1', Value2: 'Test2', FromDate: '2020-05-12T00:00:00Z', ToDate: '2020-05-12T00:05:00Z' }, { TestId1: '3', TestId2: '4', Value1: 'Test3', Value2: 'Test4', FromDate: '2020-05-12T00:05:00Z' }], output: {}, rowsAffected: [2] }
    const SINGLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_2 = { recordset: [{ TestId: '3', Value: 'Test3', FromDate: '2020-05-12T00:00:00Z', ToDate: '2020-05-12T00:05:00Z' }, { TestId: '4', Value: 'Test4', FromDate: '2020-05-12T00:10:00Z' }], output: {}, rowsAffected: [2] }
    const MULTIPLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_2 = { recordset: [{ TestId1: '5', TestId2: '6', Value1: 'Test5', Value2: 'Test6', FromDate: '2020-05-12T00:00:00Z', ToDate: '2020-05-12T00:10:00Z' }, { TestId1: '7', TestId2: '8', Value1: 'Test7', Value2: 'Test8', FromDate: '2020-05-12T00:10:00Z' }], output: {}, rowsAffected: [2] }

    const SINGLE_SPEC_NEW_RECORD_DATE_SQL_RESULT = { recordset: [{ TestId: '1', Value: 'Test1', FromDate: '2020-05-12T00:03:00Z' }], output: {}, rowsAffected: [1] }
    const MULTIPLE_SPEC_NEW_RECORD_DATE_SQL_RESULT = { recordset: [{ TestId1: '1', TestId2: '2', Value1: 'Test1', Value2: 'Test2', FromDate: '2020-05-12T00:04:00Z' }], output: {}, rowsAffected: [1] }

    const SINGLE_SPEC_OLDNEW_RECORD_WITHIN_PERIOD_DATE_SQL_RESULT = { recordset: [{ TestId: '1', Value: 'Test1', FromDate: '2020-05-12T00:05:00Z', ToDate: '2020-05-12T00:10:00Z' }, { TestId: '2', Value: 'Test2', FromDate: '2020-05-12T00:10:00Z' }], output: {}, rowsAffected: [2] }
    const MULTIPLE_SPEC_OLDNEW_RECORD_WITHIN_PERIOD_DATE_SQL_RESULT = { recordset: [{ TestId1: '1', TestId2: '2', Value1: 'Test1', Value2: 'Test2', FromDate: '2020-05-12T00:05:00Z', ToDate: '2020-05-12T00:10:00Z' }, { TestId1: '3', TestId2: '4', Value1: 'Test3', Value2: 'Test4', FromDate: '2020-05-12T00:10:00Z' }], output: {}, rowsAffected: [2] }

    var retriever, queryReturns, requests, sqlMock, mockDate = new Date('2020-05-14T08:29:42.386Z')

    beforeEach(() => {
        jasmine.clock().install()
        jasmine.clock().mockDate(mockDate)
        requests = []
        queryReturns = []
        sqlMock = jasmine.createSpyObj('sqlserver', ['request'])
        sqlMock.request.and.callFake(() => {
            let requestMock = jasmine.createSpyObj('request', ['input', 'query'])
            requestMock.query.and.returnValue(Promise.resolve(queryReturns.shift()))
            requestMock.input.and.returnValue(requestMock)
            requests.push(requestMock)
            return requestMock
        })
    })

    afterEach(() => {
        jasmine.clock().uninstall()
    })

    function createRetriever(spec, map) {
        return new DataRangeRetriever(spec, map, sqlMock)
    }

    describe('without date range', () => {
        for (const { testname, spec, map, queryResult, expectedResult } of [
            { testname: 'single spec', spec: SINGLE_SPEC, map: SINGLE_MAPPING, queryResult: SINGLE_SPEC_SINGLE_ITEM_NO_DATES_SQL_RESULT, expectedResult: JSON.stringify({ changeType: 'add', changeDate: '2020-05-14T08:29:42Z', newRecord: { main_id: '1', content: 'Test' } }) },
            { testname: 'multiple spec', spec: MULTIPLE_SPEC, map: MULTIPLE_MAPPING, queryResult: MULTIPLE_SPEC_SINGLE_ITEM_NO_DATES_SQL_RESULT, expectedResult: JSON.stringify({ changeType: 'add', changeDate: '2020-05-14T08:29:42Z', newRecord: { primary_id: '1', secondary_id: '2', vendor: 'Test1', model: 'Test2' } }) },
        ]) {
            it(`returns single item from database on single line with ${testname}`, async () => {
                queryReturns.push(queryResult)
                retriever = createRetriever(spec, map)

                let result = await retriever.get(undefined, undefined)

                expect(result).toEqual(expectedResult)
            })
        }

        for (const { testname, spec, map, queryResult, expectedResult } of [
            { testname: 'single spec', spec: SINGLE_SPEC, map: SINGLE_MAPPING, queryResult: SINGLE_SPEC_MULTIPLE_ITEM_NO_DATES_SQL_RESULT, expectedResult: JSON.stringify({ changeType: 'add', changeDate: '2020-05-14T08:29:42Z', newRecord: { main_id: '1', content: 'Test1' } }) + '\n' + JSON.stringify({ changeType: 'add', changeDate: '2020-05-14T08:29:42Z', newRecord: { main_id: '2', content: 'Test2' } }) },
            { testname: 'multiple spec', spec: MULTIPLE_SPEC, map: MULTIPLE_MAPPING, queryResult: MULTIPLE_SPEC_MULTIPLE_ITEM_NO_DATES_SQL_RESULT, expectedResult: JSON.stringify({ changeType: 'add', changeDate: '2020-05-14T08:29:42Z', newRecord: { primary_id: '1', secondary_id: '2', vendor: 'Test1', model: 'Test2' } }) + '\n' + JSON.stringify({ changeType: 'add', changeDate: '2020-05-14T08:29:42Z', newRecord: { primary_id: '3', secondary_id: '4', vendor: 'Test3', model: 'Test4' } }) },
        ]) {
            it(`returns multiple items from database on separate lines with ${testname}`, async () => {
                queryReturns.push(queryResult)
                retriever = createRetriever(spec, map)

                let result = await retriever.get(undefined, undefined)

                expect(result).toEqual(expectedResult)
            })
        }

        for (const { testname, spec, map, queryResult, expectedResult } of [
            { testname: 'single spec', spec: SINGLE_SPEC, map: SINGLE_MAPPING_WITH_BOOLEAN_TYPE, queryResult: SINGLE_SPEC_SINGLE_ITEM_NO_DATES_BOOLEAN_SQL_RESULT, expectedResult: JSON.stringify({ changeType: 'add', changeDate: '2020-05-14T08:29:42Z', newRecord: { main_id: '1', switch: false } }) },
            { testname: 'multiple spec', spec: MULTIPLE_SPEC, map: MULTIPLE_MAPPING_WITH_BOOLEAN_TYPE, queryResult: MULTIPLE_SPEC_SINGLE_ITEM_NO_DATES_BOOLEAN_SQL_RESULT, expectedResult: JSON.stringify({ changeType: 'add', changeDate: '2020-05-14T08:29:42Z', newRecord: { primary_id: '1', secondary_id: '2', switch1: true, switch2: false } }) },
        ]) {
            it(`converts boolean string to boolean type when specified in mapping with ${testname}`, async () => {
                queryReturns.push(queryResult)
                retriever = createRetriever(spec, map)

                let result = await retriever.get(undefined, undefined)

                expect(result).toEqual(expectedResult)
            })
        }

        for (const { testname, spec, queryResult } of [
            { testname: 'single spec', spec: SINGLE_SPEC, queryResult: EMPTY_SQL_RESULT },
            { testname: 'multiple spec', spec: MULTIPLE_SPEC, queryResult: EMPTY_SQL_RESULT },
        ]) {
            it(`returns empty string when no items found in database according to spec with ${testname}`, async () => {
                queryReturns.push(queryResult)
                retriever = createRetriever(spec, [])

                let result = await retriever.get(undefined, undefined)

                expect(result).toEqual('')
            })
        }

        for (const { testname, spec, queryResult, expectedSql } of [
            { testname: 'single spec', spec: SINGLE_SPEC, queryResult: EMPTY_SQL_RESULT, expectedSql: 'SELECT TestId,Value FROM TestSingle WHERE FromDate < GETDATE() AND ToDate IS NULL' },
            { testname: 'multiple spec', spec: MULTIPLE_SPEC, queryResult: EMPTY_SQL_RESULT, expectedSql: 'SELECT TestId1,TestId2,Value1,Value2 FROM TestMultiple WHERE FromDate < GETDATE() AND ToDate IS NULL' },
        ]) {
            it(`queries with correct sql with ${testname}`, async () => {
                queryReturns.push(queryResult)
                retriever = createRetriever(spec, [])

                await retriever.get(undefined, undefined)

                sqlExpect(requests).toHaveRunQuery(expectedSql)
            })
        }
    })

    describe('with date range', () => {
        describe('deletion', () => {
            for (const { testname, spec, map, queryResults, expectedSql } of [
                { testname: 'single spec', spec: SINGLE_SPEC, map: SINGLE_MAPPING, queryResults: [EMPTY_SQL_RESULT, EMPTY_SQL_RESULT], expectedSql: "SELECT TestId FROM TestSingle WHERE ToDate >= Convert(datetime,@fromDate) AND ToDate < Convert(datetime,@toDate) AND NewVersionId IS NULL" },
                { testname: 'multiple spec', spec: MULTIPLE_SPEC, map: MULTIPLE_MAPPING, queryResults: [EMPTY_SQL_RESULT, EMPTY_SQL_RESULT], expectedSql: "SELECT TestId1,TestId2 FROM TestMultiple WHERE ToDate >= Convert(datetime,@fromDate) AND ToDate < Convert(datetime,@toDate) AND NewVersionId IS NULL" },
            ]) {
                it(`queries for deleted items with ${testname} within date range`, async () => {
                    queryReturns = queryReturns.concat(queryResults)
                    retriever = createRetriever(spec, map)

                    await retriever.get('2020-05-12T00:00:00Z', '2020-05-12T00:20:00Z')

                    sqlExpect(requests).toHaveRunQuery(expectedSql).withParameter('fromDate', '2020-05-12T00:00:00.000Z').withParameter('toDate', '2020-05-12T00:20:00.000Z')
                })
            }

            for (const { testname, spec, map, queryResults, expectedSql, expectedParameters } of [
                {
                    testname: 'single spec',
                    spec: SINGLE_SPEC,
                    map: SINGLE_MAPPING,
                    queryResults: [SINGLE_SPEC_SINGLE_ID_ITEM_DATE_SQL_RESULT, SINGLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1, EMPTY_SQL_RESULT],
                    expectedSql: "SELECT TestId,Value,FromDate,ToDate FROM (SELECT ROW_NUMBER() OVER (ORDER BY InternalId) AS RowNumber, COUNT(*) OVER () AS Total,* FROM TestSingle WHERE ((FromDate >= Convert(datetime,@fromDate) AND FromDate < Convert(datetime,@toDate)) OR (ToDate > Convert(datetime,@fromDate) AND ToDate < Convert(datetime,@toDate))) AND TestId=@TestId) a WHERE (RowNumber=1 AND FromDate <= Convert(datetime,@fromDate)) OR RowNumber=Total",
                    expectedParameters: { TestId: '1' },
                },
                {
                    testname: 'multiple spec',
                    spec: MULTIPLE_SPEC,
                    map: MULTIPLE_MAPPING,
                    queryResults: [MULTIPLE_SPEC_SINGLE_ID_ITEM_DATE_SQL_RESULT, MULTIPLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1, EMPTY_SQL_RESULT],
                    expectedSql: "SELECT TestId1,TestId2,Value1,Value2,FromDate,ToDate FROM (SELECT ROW_NUMBER() OVER (ORDER BY InternalId) AS RowNumber, COUNT(*) OVER () AS Total,* FROM TestMultiple WHERE ((FromDate >= Convert(datetime,@fromDate) AND FromDate < Convert(datetime,@toDate)) OR (ToDate > Convert(datetime,@fromDate) AND ToDate < Convert(datetime,@toDate))) AND TestId1=@TestId1 AND TestId2=@TestId2) a WHERE (RowNumber=1 AND FromDate <= Convert(datetime,@fromDate)) OR RowNumber=Total",
                    expectedParameters: { TestId1: '1', TestId2: '2' },
                },
            ]) {
                it(`queries for single delete id to get old record with ${testname} within date range`, async () => {
                    queryReturns = queryReturns.concat(queryResults)
                    retriever = createRetriever(spec, map)

                    await retriever.get('2020-05-12T00:00:00Z', '2020-05-12T00:20:00Z')

                    let expectation = sqlExpect(requests).toHaveRunQuery(expectedSql).withParameter('fromDate', '2020-05-12T00:00:00.000Z').withParameter('toDate', '2020-05-12T00:20:00.000Z')
                    for (const idcolumn of spec.id_columns) {
                        expectation = expectation.withParameter(idcolumn, expectedParameters[idcolumn])
                    }
                })
            }

            for (const { testname, spec, map, queryResults, expectedSql, expectedParameters } of [
                {
                    testname: 'single spec',
                    spec: SINGLE_SPEC,
                    map: SINGLE_MAPPING,
                    queryResults: [SINGLE_SPEC_MULTIPLE_ID_ITEM_DATE_SQL_RESULT, SINGLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1, SINGLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_2, EMPTY_SQL_RESULT],
                    expectedSql: "SELECT TestId,Value,FromDate,ToDate FROM (SELECT ROW_NUMBER() OVER (ORDER BY InternalId) AS RowNumber, COUNT(*) OVER () AS Total,* FROM TestSingle WHERE ((FromDate >= Convert(datetime,@fromDate) AND FromDate < Convert(datetime,@toDate)) OR (ToDate > Convert(datetime,@fromDate) AND ToDate < Convert(datetime,@toDate))) AND TestId=@TestId) a WHERE (RowNumber=1 AND FromDate <= Convert(datetime,@fromDate)) OR RowNumber=Total",
                    expectedParameters: [{ TestId: '1' }, { TestId: '2' }],
                },
                {
                    testname: 'multiple spec',
                    spec: MULTIPLE_SPEC,
                    map: MULTIPLE_MAPPING,
                    queryResults: [MULTIPLE_SPEC_MULTIPLE_ID_ITEM_DATE_SQL_RESULT, MULTIPLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1, MULTIPLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_2, EMPTY_SQL_RESULT],
                    expectedSql: "SELECT TestId1,TestId2,Value1,Value2,FromDate,ToDate FROM (SELECT ROW_NUMBER() OVER (ORDER BY InternalId) AS RowNumber, COUNT(*) OVER () AS Total,* FROM TestMultiple WHERE ((FromDate >= Convert(datetime,@fromDate) AND FromDate < Convert(datetime,@toDate)) OR (ToDate > Convert(datetime,@fromDate) AND ToDate < Convert(datetime,@toDate))) AND TestId1=@TestId1 AND TestId2=@TestId2) a WHERE (RowNumber=1 AND FromDate <= Convert(datetime,@fromDate)) OR RowNumber=Total",
                    expectedParameters: [{ TestId1: '1', TestId2: '2' }, { TestId1: '3', TestId2: '4' }],
                },
            ]) {
                it(`queries for multiple deleted id's to get old record with ${testname} within date range`, async () => {
                    queryReturns = queryReturns.concat(queryResults)
                    retriever = createRetriever(spec, map)

                    await retriever.get('2020-05-12T00:00:00Z', '2020-05-12T00:20:00Z')

                    for (const expectedParameter of expectedParameters) {
                        let expectation = sqlExpect(requests).toHaveRunQuery(expectedSql).withParameter('fromDate', '2020-05-12T00:00:00.000Z').withParameter('toDate', '2020-05-12T00:20:00.000Z')
                        for (const idcolumn of spec.id_columns) {
                            expectation = expectation.withParameter(idcolumn, expectedParameter[idcolumn])
                        }
                    }
                })
            }

            for (const { testname, spec, map, queryResults, expectedResult } of [
                {
                    testname: 'single spec',
                    spec: SINGLE_SPEC,
                    map: SINGLE_MAPPING,
                    queryResults: [SINGLE_SPEC_MULTIPLE_ID_ITEM_DATE_SQL_RESULT, SINGLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1, SINGLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_2, EMPTY_SQL_RESULT],
                    expectedResult: JSON.stringify({ changeType: 'delete', changeDate: '2020-05-12T00:10:00Z', oldRecord: { main_id: '1', content: 'Test1' } }) + '\n' + JSON.stringify({ changeType: 'delete', changeDate: '2020-05-12T00:05:00Z', oldRecord: { main_id: '3', content: 'Test3' } })
                },
                {
                    testname: 'multiple spec',
                    spec: MULTIPLE_SPEC,
                    map: MULTIPLE_MAPPING,
                    queryResults: [MULTIPLE_SPEC_MULTIPLE_ID_ITEM_DATE_SQL_RESULT, MULTIPLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1, MULTIPLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_2, EMPTY_SQL_RESULT],
                    expectedResult: JSON.stringify({ changeType: 'delete', changeDate: '2020-05-12T00:05:00Z', oldRecord: { primary_id: '1', secondary_id: '2', vendor: 'Test1', model: 'Test2' } }) + '\n' + JSON.stringify({ changeType: 'delete', changeDate: '2020-05-12T00:10:00Z', oldRecord: { primary_id: '5', secondary_id: '6', vendor: 'Test5', model: 'Test6' } }),
                },
            ]) {
                it(`returns multiple deleted id's on multiple lines with ${testname}`, async () => {
                    queryReturns = queryReturns.concat(queryResults)
                    retriever = createRetriever(spec, map)

                    let result = await retriever.get('2020-05-12T00:00:00Z', '2020-05-12T00:20:00Z')

                    expect(result).toEqual(expectedResult)
                })
            }

            for (const { testname, spec, map, queryResults, expectedResult } of [
                { testname: 'single spec', spec: SINGLE_SPEC, map: SINGLE_MAPPING, queryResults: [SINGLE_SPEC_SINGLE_ID_ITEM_DATE_SQL_RESULT, SINGLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1, EMPTY_SQL_RESULT], expectedResult: JSON.stringify({ changeType: 'delete', changeDate: '2020-05-12T00:10:00Z', oldRecord: { main_id: '1', content: 'Test1' } }) },
                { testname: 'multiple spec', spec: MULTIPLE_SPEC, map: MULTIPLE_MAPPING, queryResults: [MULTIPLE_SPEC_SINGLE_ID_ITEM_DATE_SQL_RESULT, MULTIPLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1, EMPTY_SQL_RESULT], expectedResult: JSON.stringify({ changeType: 'delete', changeDate: '2020-05-12T00:05:00Z', oldRecord: { primary_id: '1', secondary_id: '2', vendor: 'Test1', model: 'Test2' } }) },
            ]) {
                it(`returns single deleted item on single line with ${testname}`, async () => {
                    queryReturns = queryReturns.concat(queryResults)
                    retriever = createRetriever(spec, map)

                    let result = await retriever.get('2020-05-12T00:00:00Z', '2020-05-12T00:20:00Z')

                    expect(result).toEqual(expectedResult)
                })
            }

            for (const { testname, spec, map, queryResults } of [
                { testname: 'single spec', spec: SINGLE_SPEC, map: SINGLE_MAPPING, queryResults: [SINGLE_SPEC_SINGLE_ID_ITEM_DATE_SQL_RESULT, SINGLE_SPEC_OLDNEW_RECORD_WITHIN_PERIOD_DATE_SQL_RESULT, EMPTY_SQL_RESULT] },
                { testname: 'multiple spec', spec: MULTIPLE_SPEC, map: MULTIPLE_MAPPING, queryResults: [MULTIPLE_SPEC_SINGLE_ID_ITEM_DATE_SQL_RESULT, MULTIPLE_SPEC_OLDNEW_RECORD_WITHIN_PERIOD_DATE_SQL_RESULT, EMPTY_SQL_RESULT] },
            ]) {
                it(`does not return item when FromDate on oldRecord is within given period with ${testname}`, async () => {
                    queryReturns = queryReturns.concat(queryResults)
                    retriever = createRetriever(spec, map)

                    let result = await retriever.get('2020-05-12T00:00:00Z', '2020-05-12T00:20:00Z')

                    expect(result).toEqual('')
                })
            }
        })

        describe('change', () => {
            for (const { testname, spec, map, queryResults, expectedSql } of [
                { testname: 'single spec', spec: SINGLE_SPEC, map: SINGLE_MAPPING, queryResults: [EMPTY_SQL_RESULT, EMPTY_SQL_RESULT], expectedSql: "SELECT TestId FROM TestSingle a WHERE a.FromDate >= Convert(datetime,@fromDate) AND a.FromDate < Convert(datetime,@toDate) AND ((a.ToDate IS NULL AND a.NewVersionId IS NULL) OR Convert(datetime,@toDate) < (SELECT b.FromDate FROM TestSingle b WHERE a.NewVersionId = b.InternalId))" },
                { testname: 'multiple spec', spec: MULTIPLE_SPEC, map: MULTIPLE_MAPPING, queryResults: [EMPTY_SQL_RESULT, EMPTY_SQL_RESULT], expectedSql: "SELECT TestId1,TestId2 FROM TestMultiple a WHERE a.FromDate >= Convert(datetime,@fromDate) AND a.FromDate < Convert(datetime,@toDate) AND ((a.ToDate IS NULL AND a.NewVersionId IS NULL) OR Convert(datetime,@toDate) < (SELECT b.FromDate FROM TestMultiple b WHERE a.NewVersionId = b.InternalId))" },
            ]) {
                it(`queries for active or new items with ${testname} within date range`, async () => {
                    queryReturns = queryReturns.concat(queryResults)
                    retriever = createRetriever(spec, map)

                    await retriever.get('2020-05-12T00:00:00Z', '2020-05-12T00:20:00Z')

                    sqlExpect(requests).toHaveRunQuery(expectedSql).withParameter('fromDate', '2020-05-12T00:00:00.000Z').withParameter('toDate', '2020-05-12T00:20:00.000Z')
                })
            }

            for (const { testname, spec, map, queryResults, expectedSql, expectedParameters } of [
                {
                    testname: 'single spec',
                    spec: SINGLE_SPEC,
                    map: SINGLE_MAPPING,
                    queryResults: [EMPTY_SQL_RESULT, SINGLE_SPEC_SINGLE_ID_ITEM_DATE_SQL_RESULT, SINGLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1],
                    expectedSql: "SELECT TestId,Value,FromDate,ToDate FROM (SELECT ROW_NUMBER() OVER (ORDER BY InternalId) AS RowNumber, COUNT(*) OVER () AS Total,* FROM TestSingle WHERE ((FromDate >= Convert(datetime,@fromDate) AND FromDate < Convert(datetime,@toDate)) OR (ToDate > Convert(datetime,@fromDate) AND ToDate < Convert(datetime,@toDate))) AND TestId=@TestId) a WHERE (RowNumber=1 AND FromDate <= Convert(datetime,@fromDate)) OR RowNumber=Total",
                    expectedParameters: { TestId: '1' },
                },
                {
                    testname: 'multiple spec',
                    spec: MULTIPLE_SPEC,
                    map: MULTIPLE_MAPPING,
                    queryResults: [EMPTY_SQL_RESULT, MULTIPLE_SPEC_SINGLE_ID_ITEM_DATE_SQL_RESULT, MULTIPLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1],
                    expectedSql: "SELECT TestId1,TestId2,Value1,Value2,FromDate,ToDate FROM (SELECT ROW_NUMBER() OVER (ORDER BY InternalId) AS RowNumber, COUNT(*) OVER () AS Total,* FROM TestMultiple WHERE ((FromDate >= Convert(datetime,@fromDate) AND FromDate < Convert(datetime,@toDate)) OR (ToDate > Convert(datetime,@fromDate) AND ToDate < Convert(datetime,@toDate))) AND TestId1=@TestId1 AND TestId2=@TestId2) a WHERE (RowNumber=1 AND FromDate <= Convert(datetime,@fromDate)) OR RowNumber=Total",
                    expectedParameters: { TestId1: '1', TestId2: '2' },
                },
            ]) {
                it(`queries for single change id to get old and new record with ${testname} within date range`, async () => {
                    queryReturns = queryReturns.concat(queryResults)
                    retriever = createRetriever(spec, map)

                    await retriever.get('2020-05-12T00:00:00Z', '2020-05-12T00:20:00Z')

                    let expectation = sqlExpect(requests).toHaveRunQuery(expectedSql).withParameter('fromDate', '2020-05-12T00:00:00.000Z').withParameter('toDate', '2020-05-12T00:20:00.000Z')
                    for (const idcolumn of spec.id_columns) {
                        expectation = expectation.withParameter(idcolumn, expectedParameters[idcolumn])
                    }
                })
            }

            for (const { testname, spec, map, queryResults, expectedSql, expectedParameters } of [
                {
                    testname: 'single spec',
                    spec: SINGLE_SPEC,
                    map: SINGLE_MAPPING,
                    queryResults: [EMPTY_SQL_RESULT, SINGLE_SPEC_MULTIPLE_ID_ITEM_DATE_SQL_RESULT, SINGLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1, SINGLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_2],
                    expectedSql: "SELECT TestId,Value,FromDate,ToDate FROM (SELECT ROW_NUMBER() OVER (ORDER BY InternalId) AS RowNumber, COUNT(*) OVER () AS Total,* FROM TestSingle WHERE ((FromDate >= Convert(datetime,@fromDate) AND FromDate < Convert(datetime,@toDate)) OR (ToDate > Convert(datetime,@fromDate) AND ToDate < Convert(datetime,@toDate))) AND TestId=@TestId) a WHERE (RowNumber=1 AND FromDate <= Convert(datetime,@fromDate)) OR RowNumber=Total",
                    expectedParameters: [{ TestId: '1' }, { TestId: '2' }],
                },
                {
                    testname: 'multiple spec',
                    spec: MULTIPLE_SPEC,
                    map: MULTIPLE_MAPPING,
                    queryResults: [EMPTY_SQL_RESULT, MULTIPLE_SPEC_MULTIPLE_ID_ITEM_DATE_SQL_RESULT, MULTIPLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1, MULTIPLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_2],
                    expectedSql: "SELECT TestId1,TestId2,Value1,Value2,FromDate,ToDate FROM (SELECT ROW_NUMBER() OVER (ORDER BY InternalId) AS RowNumber, COUNT(*) OVER () AS Total,* FROM TestMultiple WHERE ((FromDate >= Convert(datetime,@fromDate) AND FromDate < Convert(datetime,@toDate)) OR (ToDate > Convert(datetime,@fromDate) AND ToDate < Convert(datetime,@toDate))) AND TestId1=@TestId1 AND TestId2=@TestId2) a WHERE (RowNumber=1 AND FromDate <= Convert(datetime,@fromDate)) OR RowNumber=Total",
                    expectedParameters: [{ TestId1: '1', TestId2: '2' }, { TestId1: '3', TestId2: '4' }],
                },
            ]) {
                it(`queries for multiple changed id's to get old and new record with ${testname} within date range`, async () => {
                    queryReturns = queryReturns.concat(queryResults)
                    retriever = createRetriever(spec, map)

                    await retriever.get('2020-05-12T00:00:00Z', '2020-05-12T00:20:00Z')

                    for (const expectedParameter of expectedParameters) {
                        let expectation = sqlExpect(requests).toHaveRunQuery(expectedSql).withParameter('fromDate', '2020-05-12T00:00:00.000Z').withParameter('toDate', '2020-05-12T00:20:00.000Z')
                        for (const idcolumn of spec.id_columns) {
                            expectation = expectation.withParameter(idcolumn, expectedParameter[idcolumn])
                        }
                    }
                })
            }

            for (const { testname, spec, map, queryResults, expectedResult } of [
                {
                    testname: 'single spec',
                    spec: SINGLE_SPEC,
                    map: SINGLE_MAPPING,
                    queryResults: [EMPTY_SQL_RESULT, SINGLE_SPEC_MULTIPLE_ID_ITEM_DATE_SQL_RESULT, SINGLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1, SINGLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_2],
                    expectedResult: JSON.stringify({ changeType: 'modify', changeDate: '2020-05-12T00:15:00Z', oldRecord: { main_id: '1', content: 'Test1' }, newRecord: { main_id: '2', content: 'Test2' } }) + '\n' + JSON.stringify({ changeType: 'modify', changeDate: '2020-05-12T00:10:00Z', oldRecord: { main_id: '3', content: 'Test3' }, newRecord: { main_id: '4', content: 'Test4' } })
                },
                {
                    testname: 'multiple spec',
                    spec: MULTIPLE_SPEC,
                    map: MULTIPLE_MAPPING,
                    queryResults: [EMPTY_SQL_RESULT, MULTIPLE_SPEC_MULTIPLE_ID_ITEM_DATE_SQL_RESULT, MULTIPLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1, MULTIPLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_2],
                    expectedResult: JSON.stringify({ changeType: 'modify', changeDate: '2020-05-12T00:05:00Z', oldRecord: { primary_id: '1', secondary_id: '2', vendor: 'Test1', model: 'Test2' }, newRecord: { primary_id: '3', secondary_id: '4', vendor: 'Test3', model: 'Test4' } }) + '\n' + JSON.stringify({ changeType: 'modify', changeDate: '2020-05-12T00:10:00Z', oldRecord: { primary_id: '5', secondary_id: '6', vendor: 'Test5', model: 'Test6' }, newRecord: { primary_id: '7', secondary_id: '8', vendor: 'Test7', model: 'Test8' } }),
                },
            ]) {
                it(`returns multiple changed id's on multiple lines with ${testname}`, async () => {
                    queryReturns = queryReturns.concat(queryResults)
                    retriever = createRetriever(spec, map)

                    let result = await retriever.get('2020-05-12T00:00:00Z', '2020-05-12T00:20:00Z')

                    expect(result).toEqual(expectedResult)
                })
            }

            for (const { testname, spec, map, queryResults, expectedResult } of [
                { testname: 'single spec', spec: SINGLE_SPEC, map: SINGLE_MAPPING, queryResults: [EMPTY_SQL_RESULT, SINGLE_SPEC_SINGLE_ID_ITEM_DATE_SQL_RESULT, SINGLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1], expectedResult: JSON.stringify({ changeType: 'modify', changeDate: '2020-05-12T00:15:00Z', oldRecord: { main_id: '1', content: 'Test1' }, newRecord: { main_id: '2', content: 'Test2' } }) },
                { testname: 'multiple spec', spec: MULTIPLE_SPEC, map: MULTIPLE_MAPPING, queryResults: [EMPTY_SQL_RESULT, MULTIPLE_SPEC_SINGLE_ID_ITEM_DATE_SQL_RESULT, MULTIPLE_SPEC_OLDNEW_RECORD_DATE_SQL_RESULT_1], expectedResult: JSON.stringify({ changeType: 'modify', changeDate: '2020-05-12T00:05:00Z', oldRecord: { primary_id: '1', secondary_id: '2', vendor: 'Test1', model: 'Test2' }, newRecord: { primary_id: '3', secondary_id: '4', vendor: 'Test3', model: 'Test4' } }) },
            ]) {
                it(`returns single changed item on single line with ${testname}`, async () => {
                    queryReturns = queryReturns.concat(queryResults)
                    retriever = createRetriever(spec, map)

                    let result = await retriever.get('2020-05-12T00:00:00Z', '2020-05-12T00:20:00Z')

                    expect(result).toEqual(expectedResult)
                })
            }

            for (const { testname, spec, map, queryResults, expectedResult } of [
                { testname: 'single spec', spec: SINGLE_SPEC, map: SINGLE_MAPPING, queryResults: [EMPTY_SQL_RESULT, SINGLE_SPEC_SINGLE_ID_ITEM_DATE_SQL_RESULT, SINGLE_SPEC_NEW_RECORD_DATE_SQL_RESULT], expectedResult: JSON.stringify({ changeType: 'add', changeDate: '2020-05-12T00:03:00Z', newRecord: { main_id: '1', content: 'Test1' } }) },
                { testname: 'multiple spec', spec: MULTIPLE_SPEC, map: MULTIPLE_MAPPING, queryResults: [EMPTY_SQL_RESULT, MULTIPLE_SPEC_SINGLE_ID_ITEM_DATE_SQL_RESULT, MULTIPLE_SPEC_NEW_RECORD_DATE_SQL_RESULT], expectedResult: JSON.stringify({ changeType: 'add', changeDate: '2020-05-12T00:04:00Z', newRecord: { primary_id: '1', secondary_id: '2', vendor: 'Test1', model: 'Test2' } }) },
            ]) {
                it(`returns only newRecord when old/newRecord query only returns one row with ${testname}`, async () => {
                    queryReturns = queryReturns.concat(queryResults)
                    retriever = createRetriever(spec, map)

                    let result = await retriever.get('2020-05-12T00:00:00Z', '2020-05-12T00:20:00Z')

                    expect(result).toEqual(expectedResult)
                })
            }
        })
    })
})