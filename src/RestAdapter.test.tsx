/* tslint:disable:no-any */

import {RestAdapter} from './RestAdapter';
import {AdapterConfiguration} from './AdapterConfiguration';
import {ApiError} from './Error/ApiError';

const fetchMock = require('jest-fetch-mock');

/* tslint:disable-next-line:no-unused-expression no-any */
function buildTestConfiguration(responseData: string | undefined, error: any = undefined) {
    if (error) {
        fetchMock.mockReject(error);
    } else if (responseData) {
        fetchMock.mockResponseOnce(responseData);
    }
    return new AdapterConfiguration(
        {
            credentials: undefined,
            hostname: '',
            path: '',
            port: undefined,
            protocol: '',
            toString: () => {
                return 'url:';
            }
        },
        {},
        fetchMock
    );
}

describe('findAll', () => {
    it('success should trigger then()', () => {
        expect.assertions(3);
        fetchMock.resetMocks();
        const users = [
            {
                id: 1,
                name: 'Ewald Cremin'
            },
            {
                id: 1,
                name: 'Haylie Crooks'
            }
        ];

        const adapter = new RestAdapter(buildTestConfiguration(JSON.stringify(users)));
        const promise = adapter.findAll('users');

        return promise.then(result => {
            expect(result).toEqual(users);
            expect(fetchMock.mock.calls.length).toEqual(1);
            expect(fetchMock.mock.calls[0][0]).toEqual('url:users');
        });
    });

    it('invalid body should trigger catch()', () => {
        expect.assertions(1);
        fetchMock.resetMocks();
        const adapter = new RestAdapter(buildTestConfiguration('not a json string'));
        const promise = adapter.findAll('users');

        return promise.catch(result => {
            expect(result).toBeInstanceOf(ApiError);
        });
    });

    it('failure should trigger catch()', () => {
        expect.assertions(4);
        fetchMock.resetMocks();
        const error = 'API error';
        const adapter = new RestAdapter(buildTestConfiguration(undefined, error));
        const promise = adapter.findAll('users');

        return promise.catch(result => {
            expect(result).toBeInstanceOf(ApiError);
            expect(result.message).toEqual(error);
            expect(fetchMock.mock.calls.length).toEqual(1);
            expect(fetchMock.mock.calls[0][0]).toEqual('url:users');
        });
    });
});

describe('findByIdentifier', () => {
    it('success should trigger then()', () => {
        expect.assertions(3);
        fetchMock.resetMocks();
        const user = {
            id: 1,
            name: 'Ewald Cremin'
        };

        const adapter = new RestAdapter(buildTestConfiguration(JSON.stringify(user)));
        const promise = adapter.findByIdentifier('users', '123');

        return promise.then(result => {
            expect(result).toEqual(user);
            expect(fetchMock.mock.calls.length).toEqual(1);
            expect(fetchMock.mock.calls[0][0]).toEqual('url:users/123');
        });
    });

    it('invalid body should trigger catch()', () => {
        expect.assertions(1);
        fetchMock.resetMocks();
        const adapter = new RestAdapter(buildTestConfiguration('not a json string'));
        const promise = adapter.findByIdentifier('user', '123');

        return promise.catch(result => {
            expect(result).toBeInstanceOf(ApiError);
        });
    });

    it('failure should trigger catch()', () => {
        expect.assertions(4);
        fetchMock.resetMocks();
        const error = 'API error';
        const adapter = new RestAdapter(buildTestConfiguration(undefined, error));
        const promise = adapter.findByIdentifier('users', '123');

        return promise.catch(result => {
            expect(result).toBeInstanceOf(ApiError);
            expect(result.message).toEqual(error);
            expect(fetchMock.mock.calls.length).toEqual(1);
            expect(fetchMock.mock.calls[0][0]).toEqual('url:users/123');
        });
    });
});

describe('execute', () => {
    it('success should trigger then()', () => {
        expect.assertions(3);
        fetchMock.resetMocks();
        const user = {
            id: 1,
            name: 'Ewald Cremin'
        };

        const adapter = new RestAdapter(buildTestConfiguration(JSON.stringify(user)));
        const promise = adapter.execute('users/123');

        return promise.then(result => {
            expect(result).toEqual(user);
            expect(fetchMock.mock.calls.length).toEqual(1);
            expect(fetchMock.mock.calls[0][0]).toEqual('url:users/123');
        });
    });

    it('invalid body should trigger catch()', () => {
        expect.assertions(1);
        fetchMock.resetMocks();
        const adapter = new RestAdapter(buildTestConfiguration('not a json string'));
        const promise = adapter.execute('users/123');

        return promise.catch(result => {
            expect(result).toBeInstanceOf(ApiError);
        });
    });

    it('failure should trigger catch()', () => {
        expect.assertions(4);
        fetchMock.resetMocks();
        const error = 'API error';
        const adapter = new RestAdapter(buildTestConfiguration(undefined, error));
        const promise = adapter.execute('users/123');

        return promise.catch(result => {
            expect(result).toBeInstanceOf(ApiError);
            expect(result.message).toEqual(error);
            expect(fetchMock.mock.calls.length).toEqual(1);
            expect(fetchMock.mock.calls[0][0]).toEqual('url:users/123');
        });
    });
});

it('fetch should be called with options', () => {
    expect.assertions(3);
    fetchMock.resetMocks();
    const options: RequestInit = {
        'method': 'POST',
        'credentials': 'include',
    };

    const adapterConfiguration = buildTestConfiguration('[]');
    adapterConfiguration.requestSettings = options;
    const adapter = new RestAdapter(adapterConfiguration);
    const promise = adapter.findAll('users');

    return promise.then(() => {
        expect(fetchMock.mock.calls.length).toEqual(1);
        expect(fetchMock.mock.calls[0][0]).toEqual('url:users');
        expect(fetchMock.mock.calls[0][1]).toEqual(options);
    });
});
