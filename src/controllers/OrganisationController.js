function OrganisationController(organisationService) {
    return {
        get: async function (req, res) {
            res.send(await organisationService.getOrganisations(req.query.fromDate, req.query.toDate));
        }
    };
}

module.exports = OrganisationController;