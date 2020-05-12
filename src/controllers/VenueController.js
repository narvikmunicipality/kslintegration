function VenueController() {
    return {
        get: async function (req, res) {
            res.set('Content-Type', 'application/x-ndjson')
            res.send('');
        }
    };
}

module.exports = VenueController;