import {RestAdapter} from './RestAdapter';
import {AdapterConfiguration} from './AdapterConfiguration';

const fetchMock = require('jest-fetch-mock');

/* tslint:disable-next-line:no-unused-expression no-any */
function buildTestConfiguration(responseData: any) {
    fetchMock.mockResponseOnce(JSON.stringify(responseData));

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

it('findAll should succeed', (done: Function) => {
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

it('findByIdentifier should succeed', (done: Function) => {
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
