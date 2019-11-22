import { AdapterConfiguration, FetchCallback } from './AdapterConfiguration';
import { Endpoint } from './Endpoint';

interface Parameters {
    hosts: string[];
    protocols: ('http:' | 'https:')[];
    ports: (number | undefined)[];
    paths: string[];
}

const getValidParameters = (includeIpv6: boolean): Parameters => {
    const hosts = [
        '127.0.0.1',
        'localhost',
        'cundd.net',
        'www.cundd.net',
    ];
    if (includeIpv6) {
        hosts.push(
            '::1',
            '2a01:488:66:1000:5c33:9122::1',
            '2a01:0488:0066:1000:5c33:9122::0001',
        );
    }

    return {
        hosts,
        protocols: [
            'http:',
            'https:',
        ],
        ports: [
            undefined,
            80,
            443,
        ],
        paths: [
            '',
            'rest',
            'rest/',
        ]
    };
};

const trimSlashes = (input: string): string => input.replace(new RegExp('^/+|/+$', 'g'), '');

describe('Object instantiation', () => {
    it('new', () => {
        const parameters = getValidParameters(true);
        const hosts = parameters.hosts;
        const protocols = parameters.protocols;
        const ports = parameters.ports;
        const paths = parameters.paths;

        hosts.forEach(host => {
            protocols.forEach(protocol => {
                ports.forEach(port => {
                    paths.forEach(path => {
                        const configuration = new AdapterConfiguration(new Endpoint(host, protocol, port, path));
                        expect(configuration.hostname).toEqual(host);
                        expect(configuration.protocol).toEqual(protocol);
                        expect(configuration.port).toEqual(port);
                        expect(trimSlashes(configuration.path)).toEqual(trimSlashes(path));
                    });
                });
            });
        });
    });

    const fromUrlTest = (buildUrlObject: boolean): void => {
        const parameters = getValidParameters(false);
        const hosts = parameters.hosts;
        const protocols = parameters.protocols;
        const ports = parameters.ports;
        const paths = parameters.paths;

        hosts.forEach(host => {
            protocols.forEach(protocol => {
                ports.forEach(port => {
                    paths.forEach(path => {
                        const urlString = port
                            ? `${protocol}//${host}:${port}/${path}`
                            : `${protocol}//${host}/${path}`;

                        const configuration = buildUrlObject
                            ? AdapterConfiguration.fromUrl(new URL(urlString))
                            : AdapterConfiguration.fromUrl(urlString);

                        expect(configuration.hostname).toEqual(host);
                        expect(configuration.protocol).toEqual(protocol);
                        expect(trimSlashes(configuration.path)).toEqual(trimSlashes(path));

                        // The default URL implementation will remove the port if it is the default for the protocol
                        if (port === 80 && protocol === 'http:') {
                            expect(configuration.port).toBeUndefined();
                        } else if (port === 443 && protocol === 'https:') {
                            expect(configuration.port).toBeUndefined();
                        } else {
                            expect(configuration.port).toEqual(port);
                        }
                    });
                });
            });
        });
    };

    it('fromUrl (URL)', () => {
        fromUrlTest(true);
    });

    it('fromUrl (string)', () => {
        fromUrlTest(false);
    });

    it('new should throw for invalid hostname', () => {
        const hosts = [
            undefined,
            '',
            'not a hostname',
            '1234',
            '1234.123',
            '1234.123.123',
            '1234.123.123.123',
            '1234.123.123.123.123',
        ];
        hosts.forEach((host) => {
            expect(() => {
                new AdapterConfiguration(new Endpoint(host as any));
            }).toThrowError('Given value is not a valid IPv4, IPv6 or hostname');
        });
    });

    it('new should throw for invalid protocol (empty protocol)', () => {
        const protocols = [
            null,
            '',
        ];
        protocols.forEach((protocol) => {
            expect(() => {
                new AdapterConfiguration(new Endpoint('localhost', protocol as any));
            }).toThrowError('Protocol must not be empty');
        });
    });

    it('new should throw for invalid protocol (missing colon)', () => {
        const protocols = [
            'http',
            'https',
            'ftp',
        ];
        protocols.forEach((protocol) => {
            expect(() => {
                new AdapterConfiguration(new Endpoint('localhost', protocol));
            }).toThrowError('Given value is not a valid protocol. Final colon missing');
        });
    });

    it('new should throw for invalid protocol (unsupported)', () => {
        const protocols = [
            'ftp:',
            'ws:',
        ];
        protocols.forEach((protocol) => {
            expect(() => {
                new AdapterConfiguration(new Endpoint('localhost', protocol));
            }).toThrowError('Given value is not a valid protocol');
        });
    });

    it('new should throw for invalid port', () => {
        const ports = [
            'ftp',
            0.1,
            80.01,
            -1,
            65535 + 1,
            NaN,
        ];
        ports.forEach((port) => {
            expect(() => {
                new AdapterConfiguration(new Endpoint('localhost', undefined, port as any));
            }).toThrowError('Given value is not a valid port number');
        });
    });
});

describe('Customizing the XHR function', () => {
    it('new should throw for invalid fetchCallback', () => {
        const error = 'Argument "fetchCallback" must either be `undefined` or a function returning a Promise';
        const callbacks = [
            'null',
            'ftp',
            0.1,
            80.01,
            -1,
            65535 + 1,
            NaN,
        ];
        callbacks.forEach(callback => {
            expect(() => {
                new AdapterConfiguration(new Endpoint('localhost'), {}, (callback as any) as FetchCallback);
            }).toThrowError(error);
        });
    });

    it('set fetchCallback should throw for invalid fetchCallback', () => {
        const error = 'Argument "fetchCallback" must either be `undefined` or a function returning a Promise';
        const callbacks = [
            'null',
            'ftp',
            0.1,
            80.01,
            -1,
            65535 + 1,
            NaN,
        ];
        const c = new AdapterConfiguration(new Endpoint('localhost'));
        callbacks.forEach(callback => {
            expect(() => {
                c.fetchCallback = callback as any;
            }).toThrowError(error);
        });
    });

    it('new should accept undefined for fetchCallback', () => {
        const c = new AdapterConfiguration(new Endpoint('localhost'), undefined);
        expect(c.fetchCallback).toBeUndefined();
    });

    it('set fetchCallback should accept undefined', () => {
        const c = new AdapterConfiguration(new Endpoint('localhost'));
        c.fetchCallback = undefined;
        expect(c.fetchCallback).toBeUndefined();
    });

    it('new should accept function for fetchCallback', () => {
        const callback = (): Promise<Response> => {
            return new Promise<Response>(() => {
            });
        };
        const c = new AdapterConfiguration(new Endpoint('localhost'), {}, callback);
        expect(c.fetchCallback).toEqual(callback);
    });

    it('set fetchCallback should accept function', () => {
        const callback = (): Promise<Response> => {
            return new Promise<Response>(() => {
            });
        };
        const c = new AdapterConfiguration(new Endpoint('localhost'));
        c.fetchCallback = callback;
        expect(c.fetchCallback).toEqual(callback);
    });
});
