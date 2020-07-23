function VismaWsXmlRetriever(http, url, authentication) {
    function replaceDateTokenWithCorrectDate(urlWithToken) {
        return urlWithToken.replace('$DATE_NOW$', new Date().toISOString().slice(0, 10))
    }

    return {
        download: async () => {
            url = replaceDateTokenWithCorrectDate(url)

            let result = await http.get(url, { auth: { username: authentication.ws_user, password: authentication.ws_password } })
            return result.data
        }
    }
}

module.exports = VismaWsXmlRetriever