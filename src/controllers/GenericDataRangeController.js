function GenericDataRangeController(personService, dateValidator) {
    return {
        get: async function (req, res) {
            if (dateValidator.isValid(req.query.fromDate, req.query.toDate)) {
                res.set('Content-Type', 'application/x-ndjson')
                res.send(await personService.get(req.query.fromDate, req.query.toDate));
            } else {
                res.status(400)
                res.send()
            }
        },
    };
}

module.exports = GenericDataRangeController