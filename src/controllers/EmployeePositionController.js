function EmployeePositionController(employeePositionService) {
    return {
        get: async function (req, res) {
            res.send(await employeePositionService.getPositions(req.query.fromDate, req.query.toDate));
        }
    };
}

module.exports = EmployeePositionController;