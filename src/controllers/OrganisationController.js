function OrganisationController(organisationService) {
    return {
        get: async function (req, res) {
            res.set('Content-Type', 'application/x-ndjson')
            res.send(await organisationService.getOrganisations(req.query.fromDate, req.query.toDate));
        }
    };
}

module.exports = OrganisationController;