describe('VismaWsXmlRetriever', () => {
    const VismaWsXmlRetriever = require('../../src/helper/VismaWsXmlRetriever')
    const EXPECTED_XML = '<some><xml></xml></some>'

    var retriever, config, httpMock

    beforeEach(() => {
        config = { visma: { ws_url: 'visma xml url', ws_user: 'testuser', ws_password: 'testpassword' } }
        httpMock = jasmine.createSpyObj('axios', ['get'])
        httpMock.get.and.returnValue(Promise.resolve({ data: EXPECTED_XML }))
        retriever = new VismaWsXmlRetriever(config, httpMock)
    })

    describe('when retrieving XML', () => {
        it('uses username and password', async () => {
            await retriever.download()

            expect(httpMock.get).toHaveBeenCalledWith(jasmine.anything(), { auth: { username: 'testuser', password: 'testpassword' } })
        })

        it('uses correct URL', async () => {
            await retriever.download()

            expect(httpMock.get).toHaveBeenCalledWith('visma xml url', jasmine.anything())
        })

        it('returns retrieved XML', async () => {
            let result = await retriever.download()

            expect(result).toEqual(EXPECTED_XML)
        })
    })
})