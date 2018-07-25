import {RestAdapter} from './RestAdapter';
import {AdapterConfiguration} from './AdapterConfiguration';

const fetchMock = require('jest-fetch-mock');

/* tslint:disable-next-line:no-unused-expression no-any */
function buildTestConfiguration(responseData: any, error: any = undefined) {
    if (error) {
        fetchMock.mockReject(error);
    } else if (responseData) {
        fetchMock.mockResponseOnce(JSON.stringify(responseData));
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
    it('success should trigger then()', (done: Function) => {
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

        const adapter = new RestAdapter(buildTestConfiguration(users));
        const promise = adapter.findAll('users');
        promise.then(result => {
            expect(result).toEqual(users);
            expect(fetchMock.mock.calls.length).toEqual(1);
            expect(fetchMock.mock.calls[0][0]).toEqual('url:users');
            done();
        });
    });

    it('failure should trigger catch()', (done: Function) => {
        expect.assertions(3);
        fetchMock.resetMocks();
        const error = 'API error';
        const adapter = new RestAdapter(buildTestConfiguration(undefined, error));
        const promise = adapter.findAll('users');
        promise.catch(result => {
            expect(result).toEqual(error);
            expect(fetchMock.mock.calls.length).toEqual(1);
            expect(fetchMock.mock.calls[0][0]).toEqual('url:users');
            done();
        });
    });
});

describe('findByIdentifier', () => {
    it('success should trigger then()', (done: Function) => {
        expect.assertions(3);
        fetchMock.resetMocks();
        const user = {
            id: 1,
            name: 'Ewald Cremin'
        };

        const adapter = new RestAdapter(buildTestConfiguration(user));
        const promise = adapter.findByIdentifier('users', '123');
        promise.then(result => {
            expect(result).toEqual(user);
            expect(fetchMock.mock.calls.length).toEqual(1);
            expect(fetchMock.mock.calls[0][0]).toEqual('url:users/123');
            done();
        });
    });

    it('failure should trigger catch()', (done: Function) => {
        expect.assertions(3);
        fetchMock.resetMocks();
        const error = 'API error';
        const adapter = new RestAdapter(buildTestConfiguration(undefined, error));
        const promise = adapter.findByIdentifier('users', '123');
        promise.catch(result => {
            expect(result).toEqual(error);
            expect(fetchMock.mock.calls.length).toEqual(1);
            expect(fetchMock.mock.calls[0][0]).toEqual('url:users/123');
            done();
        });
    });
});

it('fetch should be called with options', (done: Function) => {
    expect.assertions(3);
    fetchMock.resetMocks();
    const options: RequestInit = {
        'method': 'POST',
        'credentials': 'include',
    };

    const adapterConfiguration = buildTestConfiguration([]);
    adapterConfiguration.requestSettings = options;
    const adapter = new RestAdapter(adapterConfiguration);
    const promise = adapter.findAll('users');
    promise.then(() => {
        expect(fetchMock.mock.calls.length).toEqual(1);
        expect(fetchMock.mock.calls[0][0]).toEqual('url:users');
        expect(fetchMock.mock.calls[0][1]).toEqual(options);
        done();
    });
});
