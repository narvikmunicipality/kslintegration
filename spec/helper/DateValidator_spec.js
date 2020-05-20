describe('DateValidator', () => {
    const DateValidator = require('../../src/helper/DateValidator')

    var validator

    beforeEach(() => {
        validator = new DateValidator()
    })

    it('returns true when fromDate and toDate are valid', () => {
        let fromDate = '2020-01-02T03:04:05Z', toDate = '2020-06-07T08:09:10Z'

        expect(validator.isValid(fromDate, toDate)).toBe(true)
    })

    it('returns true when fromDate and toDate are undefined', () => {
        let fromDate = undefined, toDate = undefined

        expect(validator.isValid(fromDate, toDate)).toBe(true)
    })

    it('returns false when fromDate is after toDate', () => {
        let fromDate = '2020-06-07T08:09:10Z', toDate = '2020-01-02T03:04:05Z'

        expect(validator.isValid(fromDate, toDate)).toBe(false)
    })

    it('returns false when toDate is missing', () => {
        let fromDate = '2020-01-02T03:04:05Z', toDate = undefined

        expect(validator.isValid(fromDate, toDate)).toBe(false)
    })

    it('returns false when fromDate is missing', () => {
        let fromDate = undefined, toDate = '2020-06-07T08:09:10Z'

        expect(validator.isValid(fromDate, toDate)).toBe(false)
    })

    for (const { testName, date } of [
        { testName: 'Extra time information', date: '2020-01-02T03:04:05.678Z' },
        { testName: 'Garbled information', date: 'abcdefghijklmnopqrst' },
        { testName: 'Invalid month: 00', date: '2020-00-02T03:04:05Z' },
        { testName: 'Invalid day: 00', date: '2020-01-00T03:04:05Z' },
        { testName: 'Missing T', date: '2020-01-00 03:04:05Z' },
        { testName: 'Missing Z', date: '2020-01-02T03:04:05' },
        { testName: 'Missing T and Z', date: '2020-01-02 03:04:05' },
        { testName: 'Missing T and Z with whitespace', date: '2020-01-02 03:04:05 ' },
    ]
        .concat(sequence(13, 99).map(m => { return { testName: `Invalid month 2020-${m}-02T03:04:05Z`, date: `2020-${m}-02T03:04:05Z` } }))
        .concat(['04','06','09','11'].map(m => sequence(30, 99).map(d => { return { testName: `Invalid day 2020-${m}-${d}T03:04:05Z`, date: `2020-${m}-${d}T03:04:05Z` } })))
        .concat(['01','02','03','05','7','8','10','12'].map(m => sequence(31, 99).map(d => { return { testName: `Invalid day 2020-${m}-${d}T03:04:05Z`, date: `2020-${m}-${d}T03:04:05Z` } })))
        .concat(sequence(24, 99).map(h => { return { testName: `Invalid hour 2020-01-02T${h}:04:05Z`, date: `Invalid day 2020-01-02T${h}:04:05Z` } }))
        .concat(sequence(60, 99).map(m => { return { testName: `Invalid minute 2020-01-02T03:${m}:05Z`, date: `Invalid minute 2020-01-02T03:${m}:05Z` } }))
        .concat(sequence(60, 99).map(s => { return { testName: `Invalid second 2020-01-02T03:04:${s}Z`, date: `Invalid minute 2020-01-02T03:04:${s}Z` } }))
    ) {
        it(`returns false when fromDate is in invalid format: ${testName}`, () => {
            let fromDate = date, toDate = '2020-06-07T08:09:10Z'

            expect(validator.isValid(fromDate, toDate)).toBe(false)
        })
    }

    for (const { testName, date } of [
        { testName: 'Extra time information', date: '2020-01-02T03:04:05.678Z' },
        { testName: 'Garbled information', date: 'abcdefghijklmnopqrst' },
        { testName: 'Invalid month: 00', date: '2020-00-02T03:04:05Z' },
        { testName: 'Invalid day: 00', date: '2020-01-00T03:04:05Z' },
        { testName: 'Missing T', date: '2020-01-00 03:04:05Z' },
        { testName: 'Missing Z', date: '2020-01-02T03:04:05' },
        { testName: 'Missing T and Z', date: '2020-01-02 03:04:05' },
        { testName: 'Missing T and Z with whitespace', date: '2020-01-02 03:04:05 ' },
    ]
        .concat(sequence(13, 99).map(m => { return { testName: `Invalid month 2020-${m}-02T03:04:05Z`, date: `2020-${m}-02T03:04:05Z` } }))
        .concat(['04','06','09','11'].map(m => sequence(30, 99).map(d => { return { testName: `Invalid day 2020-${m}-${d}T03:04:05Z`, date: `2020-${m}-${d}T03:04:05Z` } })))
        .concat(['01','02','03','05','7','8','10','12'].map(m => sequence(31, 99).map(d => { return { testName: `Invalid day 2020-${m}-${d}T03:04:05Z`, date: `2020-${m}-${d}T03:04:05Z` } })))
        .concat(sequence(24, 99).map(h => { return { testName: `Invalid hour 2020-01-02T${h}:04:05Z`, date: `Invalid day 2020-01-02T${h}:04:05Z` } }))
        .concat(sequence(60, 99).map(m => { return { testName: `Invalid minute 2020-01-02T03:${m}:05Z`, date: `Invalid minute 2020-01-02T03:${m}:05Z` } }))
        .concat(sequence(60, 99).map(s => { return { testName: `Invalid second 2020-01-02T03:04:${s}Z`, date: `Invalid minute 2020-01-02T03:04:${s}Z` } }))
    ) {
        it(`returns false when toDate is in invalid format: ${testName}`, () => {
            let fromDate = '2020-01-02T03:04:05Z', toDate = date

            expect(validator.isValid(fromDate, toDate)).toBe(false)
        })
    }


    it('returns false when toDate is in invalid format', () => {
        let fromDate = '2020-01-02T03:04:05Z', toDate = '2020-06-07T08:09:10.111Z'

        expect(validator.isValid(fromDate, toDate)).toBe(false)
    })

    function sequence(start, stop, increment = 1) {
        let list = []
        for (let i = start; i <= stop; i += increment) {
            list.push(i)
        }
        return list
    }
})