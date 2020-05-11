function RequestHelper(requests) {
    let shouldHaveRun = true

    function findMatchingRequestsByQuery(requests, query) {
        let matchingRequests = []
        for (let request_i = 0; request_i < requests.length; request_i++) {
            const request = requests[request_i]

            let calls = request.query.calls.all()
            for (let calls_i = 0; calls_i < calls.length; calls_i++) {
                const call = calls[calls_i]
                if (call.args.includes(query)) {
                    matchingRequests.push(request)
                }
            }

        }
        return matchingRequests
    }

    return {
        get not() {
            shouldHaveRun = false
            return this
        },
        toHaveRunQuery: query => {
            let matchingRequests = findMatchingRequestsByQuery(requests, query)

            if (matchingRequests.length === 0 && shouldHaveRun) {
                fail(`Query '${query}' did not run, but was expected to run..`)
            } else if (matchingRequests.length !== 0 && !shouldHaveRun) {
                fail(`Query '${query}' has run, but was expected not to have run.`)
            }

            return new ParameterHelper(matchingRequests, query)
        },
    }
}

function ParameterHelper(requests, query) {
    let shouldHaveRun = true

    return {
        get not() {
            shouldHaveRun = false
            return this
        },
        withParameter: (...parameter) => {
            let matchingParameters = []
            for (let request_i = 0; request_i < requests.length; request_i++) {
                const request = requests[request_i];

                let calls = request.input.calls.all()
                for (let calls_i = 0; calls_i < calls.length; calls_i++) {
                    const call = calls[calls_i]

                    if (call.args.length == parameter.length && call.args.every((u, i) => u === parameter[i])) {
                        matchingParameters.push(request)
                    }
                }
            }

            if (matchingParameters.length === 0 && shouldHaveRun) {
                fail(`Query '${query}' was expected to be called with parameters: ${parameter.join(',')}`)
            } else if (matchingParameters.length !== 0 && !shouldHaveRun) {
                fail(`Query '${query}' was expected to not have been called with parameters: ${parameter.join(',')}`)
            }

            return new ParameterHelper(matchingParameters, query)
        }
    }
}

module.exports = RequestHelper