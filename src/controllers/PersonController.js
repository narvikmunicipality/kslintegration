function PersonController(personService) {
    return {
        get: async function (req, res) {
            res.set('Content-Type', 'application/x-ndjson')
            res.send(await personService.getPersons(req.query.fromDate, req.query.toDate));
        },     
    };
}

module.exports = PersonController;