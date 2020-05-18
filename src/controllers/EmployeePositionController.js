function EmployeePositionController(employeePositionService) {
    return {
        get: async function (req, res) {
            res.set('Content-Type', 'application/x-ndjson')
            res.send(await employeePositionService.get(req.query.fromDate, req.query.toDate));
        }
    };
}

module.exports = EmployeePositionController;