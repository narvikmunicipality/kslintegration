function PersonController(personService) {
    return {
        get: async function (req, res) {
            res.set('Content-Type', 'application/x-ndjson')
            res.send(await personService.get(req.query.fromDate, req.query.toDate));
        },     
    };
}

module.exports = PersonController;