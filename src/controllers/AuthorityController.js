function AuthorityController(config) {
    return {
        get: async function (req, res) {
            res.send({ name: config.authority.name, version: "3.0", email: config.authority.email })
        }
    }
}

module.exports = AuthorityController