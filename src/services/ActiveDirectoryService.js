function ActiveDirectoryService(ldap, clientConfig) {
    function bindToActiveDirectory(client, clientConfig) {
        return new Promise((resolve, reject) => {
            var config = clientConfig
            client.bind(config.user, config.password, (err) => {
                if (err) { reject(err) }
                else { resolve() }
            })
        })
    }

    function createSearchFilterOptions(filter, attributes) {
        return {
            filter: filter,
            scope: 'sub',
            attributes: attributes
        }
    }

    function searchActiveDirectoryWithFilter(filter, attributes, client) {
        return new Promise((resolve, reject) => {
            client.search(clientConfig.basedn, createSearchFilterOptions(filter, attributes), (error, event) => {
                var items = []
                if (error) { reject(error) }
                else {
                    event.on('searchEntry', function (entry) {
                        let item = {}
                        for (const key of attributes) {
                            item[key] = entry.object[key]
                        }
                        items.push(item)
                    })
                    event.on('error', function (err) { reject(err) })
                    event.on('end', function (result) {
                        if (result.status !== 0) { reject(new Error('LDAP error encountered: ' + result.status)) }
                        else {
                            client.unbind(() => { })
                            resolve(items)
                        }
                    })
                }
            })
        })
    }

    return {
        search: async (filter, attributes) => {
            let client = ldap.createClient({ url: clientConfig.serverUrl, timeout: clientConfig.timeout })
            await bindToActiveDirectory(client, clientConfig)
            return searchActiveDirectoryWithFilter(filter, attributes, client)
        }
    }
}

module.exports = ActiveDirectoryService