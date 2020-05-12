describe('ActiveDirectoryService', () => {
    const ActiveDirectoryService = require('../../src/services/ActiveDirectoryService');
    const expectedFilter = '(&(ssn=*)(mail=*))';
    const LDAP_ENTRY = { dn: 'CN=User - user,DC=com', controls: [], ssn: '01020304050', mail: 'mail@example.com' };
    const LDAP_ENTRY_2 = { dn: 'CN=User 2 - user,DC=com', controls: [], ssn: '02040608010', mail: 'mail2@example.com' };
    const expectedClientConfig = {
        user: 'ldapuser',
        password: 'password',
        timeout: 10000,
        serverUrl: 'ldap://example.com',
        basedn: 'CN=base,DC=dn',
    };
    var service, ldapjsMock, ldapClientMock;

    function resolveSearchSuccessfullyWithNoItems() {
        ldapClientMock.search.and.callFake((b, o, setupCallback) => {
            setupCallback(undefined, {
                on: (eventName, callback) => {
                    if (eventName === 'end') { callback({ status: 0 }); }
                }
            });
        });
    }

    function resolveBindSuccessfully() {
        ldapClientMock.bind.and.callFake((u, p, stateCallback) => { stateCallback(); });
    }

    beforeEach(() => {
        ldapClientMock = jasmine.createSpyObj('client', ['bind', 'unbind', 'search']);
        ldapjsMock = jasmine.createSpyObj('ldapjs', ['createClient']);
        ldapjsMock.createClient.and.returnValue(ldapClientMock);

        service = new ActiveDirectoryService(ldapjsMock, expectedClientConfig);
    });


    it('creates a ldap client with correct parameters', async () => {
        resolveBindSuccessfully();
        resolveSearchSuccessfullyWithNoItems();

        await service.search(expectedFilter, ['ssn', 'mail']);

        expect(ldapjsMock.createClient).toHaveBeenCalledWith({ url: expectedClientConfig.serverUrl, timeout: expectedClientConfig.timeout });
    });

    it('binds to given username and password', async () => {
        resolveBindSuccessfully();
        resolveSearchSuccessfullyWithNoItems();

        await service.search(expectedFilter, ['ssn', 'mail']);

        expect(ldapClientMock.bind).toHaveBeenCalledWith(expectedClientConfig.user, expectedClientConfig.password, jasmine.anything());
    });

    it('throws exception when bind fails', async () => {
        ldapClientMock.bind.and.callFake((u, p, stateCallback) => { stateCallback('bind error'); });

        try {
            await service.search(expectedFilter, ['ssn', 'mail']);
        } catch (err) {
            expect(err).toEqual('bind error');
            return;
        }

        fail('Should throw exception');
    });

    describe('search', () => {
        beforeEach(() => {
            resolveBindSuccessfully();
        });

        it('calls search with correct basedn', async () => {
            resolveSearchSuccessfullyWithNoItems();

            await service.search(expectedFilter, ['ssn', 'mail']);

            expect(ldapClientMock.search).toHaveBeenCalledWith(expectedClientConfig.basedn, jasmine.anything(), jasmine.anything());
        });

        it('calls search with correct options', async () => {
            let expectedOptions = { scope: 'sub', attributes: ['ssn', 'mail'], filter: expectedFilter };
            resolveSearchSuccessfullyWithNoItems();

            await service.search(expectedFilter, ['ssn', 'mail']);

            expect(ldapClientMock.search).toHaveBeenCalledWith(jasmine.anything(), expectedOptions, jasmine.anything());
        });

        it('throws exception when search fails setup', async () => {
            ldapClientMock.search.and.callFake((b, o, setupCallback) => { setupCallback('setup error', { on: () => { } }); });

            try {
                await service.search(expectedFilter, ['ssn', 'mail']);
            } catch (err) {
                expect(err).toEqual('setup error');
                return;
            }

            fail('Should throw exception');
        });

        it('does not register on-events when search fails setup', async () => {
            var registeredEvents = 0;
            ldapClientMock.search.and.callFake((b, o, setupCallback) => { setupCallback('setup error', { on: () => { registeredEvents++; } }); });

            try {
                await service.search(expectedFilter, ['ssn', 'mail']);
            } catch (err) {
                expect(registeredEvents).toBe(0);
                return;
            }

            fail('Should throw exception');
        });

        it('throws exception when search encounters ldap error', async () => {
            ldapClientMock.search.and.callFake((b, o, setupCallback) => {
                setupCallback(undefined, {
                    on: (eventName, callback) => {
                        if (eventName === 'end') { callback({ status: 1337 }); }
                    }
                });
            });

            try {
                await service.search(expectedFilter, ['ssn', 'mail']);
            } catch (err) {
                expect(err).toEqual(new Error('LDAP error encountered: 1337'));
                return;
            }

            fail('Should throw exception');
        });

        it('throws exception when search encounters an error', async () => {
            ldapClientMock.search.and.callFake((b, o, setupCallback) => {
                setupCallback(undefined, {
                    on: (eventName, callback) => {
                        if (eventName === 'error') { callback(new Error('an error')); }
                    }
                });
            });

            try {
                await service.search(expectedFilter, ['ssn', 'mail']);
            } catch (err) {
                expect(err).toEqual(new Error('an error'));
                return;
            }

            fail('Should throw exception');
        });

        it('returns item from searchEntry event when only single result found', async () => {
            ldapClientMock.search.and.callFake((b, o, setupCallback) => {
                setupCallback(undefined, {
                    on: (eventName, callback) => {
                        if (eventName === 'end') { callback({ status: 0 }); }
                        else if (eventName === 'searchEntry') { callback({ object: LDAP_ENTRY }); }
                    }
                });
            });

            let result = await service.search(expectedFilter, ['ssn', 'mail']);

            expect(result).toEqual([{ ssn: '01020304050', mail: 'mail@example.com' }]);
        });

        it('returns items from searchEntry event when multiple results found', async () => {
            ldapClientMock.search.and.callFake((b, o, setupCallback) => {
                setupCallback(undefined, {
                    on: (eventName, callback) => {
                        if (eventName === 'end') { callback({ status: 0 }); }
                        else if (eventName === 'searchEntry') {
                            callback({ object: LDAP_ENTRY });
                            callback({ object: LDAP_ENTRY_2 });
                        }
                    }
                });
            });

            let result = await service.search(expectedFilter, ['ssn', 'mail']);

            expect(result).toEqual([{ ssn: '01020304050', mail: 'mail@example.com' }, { ssn: '02040608010', mail: 'mail2@example.com' }]);
        });

        it('returns empty array when searchEntry event never called', async () => {
            resolveSearchSuccessfullyWithNoItems();

            let result = await service.search(expectedFilter, ['ssn', 'mail']);

            expect(result).toEqual([]);
        });

        it('calls unbind after end event is called', async () => {
            resolveSearchSuccessfullyWithNoItems();

            await service.search(expectedFilter, ['ssn', 'mail']);

            expect(ldapClientMock.unbind).toHaveBeenCalledWith(jasmine.anything());
        });
    });
});