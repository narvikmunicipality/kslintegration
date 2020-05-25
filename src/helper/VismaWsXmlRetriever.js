function VismaWsXmlRetriever(config, http) {
    return {
        download: async () => {
            let result = await http.get(config.visma.ws_url, { auth: { username: config.visma.ws_user, password: config.visma.ws_password } })
            return result.data
        }
    }
}

module.exports = VismaWsXmlRetriever