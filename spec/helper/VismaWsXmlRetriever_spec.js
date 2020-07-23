describe('VismaWsXmlRetriever', () => {
    const VismaWsXmlRetriever = require('../../src/helper/VismaWsXmlRetriever')
    const EXPECTED_XML = '<some><xml></xml></some>'
    const EXPECTED_URL = 'visma xml url'
    const EXPECTED_AUTHENTICATION = { ws_user: 'testuser', ws_password: 'testpassword' }
    const EXPECTED_DATE_TOKEN_URL = '$DATE_NOW$'

    var retriever, httpMock

    describe('when retrieving XML', () => {
        beforeEach(() => {
            httpMock = jasmine.createSpyObj('axios', ['get'])
            httpMock.get.and.returnValue(Promise.resolve({ data: EXPECTED_XML }))
            retriever = new VismaWsXmlRetriever(httpMock, EXPECTED_URL, EXPECTED_AUTHENTICATION)
        })
        
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

    describe('when retrieving URL with date token', () => {
        beforeEach(() => {
            httpMock = jasmine.createSpyObj('axios', ['get'])
            httpMock.get.and.returnValue(Promise.resolve({ data: EXPECTED_XML }))
            retriever = new VismaWsXmlRetriever(httpMock, EXPECTED_DATE_TOKEN_URL, EXPECTED_AUTHENTICATION)
        })
        
        it('translates $DATE_NOW$ to current time date', async () => {
            await retriever.download()

            expect(httpMock.get).toHaveBeenCalledWith(new Date().toISOString().slice(0, 10), jasmine.anything())
        })
    })
})