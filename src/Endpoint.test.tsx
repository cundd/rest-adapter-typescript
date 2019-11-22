import { Endpoint } from './Endpoint';

const getProtocols = (): any => {
    return {
        empty: [
            null,
            ''
        ],
        missingColon: [
            'http',
            'https',
            'ftp',
        ],
        unsupported: [
            'ftp:',
            'ws:',
        ],
    };
};

const getInvalidHosts = (): any => {
    return [
        undefined,
        '',
        'not a hostname',
        '1234',
        '1234.123',
        '1234.123.123',
        '1234.123.123.123',
        '1234.123.123.123.123',
    ];
};

const getInvalidPorts = (): any => {
    return [
        '',
        0.1,
        80.01,
        -1,
        65535 + 1,
        NaN,
    ];
};

const getValidParameters = (includeIpv6: boolean): any => {
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
                        const configuration = new Endpoint(host, protocol, port, path);
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
                            ? Endpoint.fromUrl(new URL(urlString))
                            : Endpoint.fromUrl(urlString);

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
        getInvalidHosts().forEach((host) => {
            expect(() => {
                new Endpoint(host as any);
            }).toThrowError('Given value is not a valid IPv4, IPv6 or hostname');
        });
    });

    it('new should throw for invalid protocol (empty protocol)', () => {
        getProtocols().empty.forEach((protocol) => {
            expect(() => {
                new Endpoint('localhost', protocol as any);
            }).toThrowError('Protocol must not be empty');
        });
    });

    it('new should throw for invalid protocol (missing colon)', () => {
        getProtocols().missingColon.forEach((protocol) => {
            expect(() => {
                new Endpoint('localhost', protocol);
            }).toThrowError('Given value is not a valid protocol. Final colon missing');
        });
    });

    it('new should throw for invalid protocol (unsupported)', () => {
        getProtocols().unsupported.forEach((protocol) => {
            expect(() => {
                new Endpoint('localhost', protocol);
            }).toThrowError('Given value is not a valid protocol');
        });
    });

    it('new should throw for invalid port', () => {
        getInvalidPorts().forEach((port) => {
            expect(() => {
                new Endpoint('localhost', undefined, port as any);
            }).toThrowError('Given value is not a valid port number');
        });
    });
});

describe('Modification', () => {
    const buildEndpoint = (): Endpoint => {
        return new Endpoint('localhost');
    };
    it('set hostname should throw for invalid hostname', () => {
        getInvalidHosts().forEach((host) => {
            expect(() => {
                buildEndpoint().hostname = host as any;
            }).toThrowError('Given value is not a valid IPv4, IPv6 or hostname');
        });
    });

    it('set protocol should throw for invalid protocol (empty protocol)', () => {
        getProtocols().empty.forEach((protocol) => {
            expect(() => {
                buildEndpoint().protocol = protocol as any;
            }).toThrowError('Protocol must not be empty');
        });
    });

    it('set protocol should throw for invalid protocol (missing colon)', () => {
        getProtocols().missingColon.forEach((protocol) => {
            expect(() => {
                buildEndpoint().protocol = protocol as any;
            }).toThrowError('Given value is not a valid protocol. Final colon missing');
        });
    });

    it('set protocol should throw for invalid protocol (unsupported)', () => {
        getProtocols().unsupported.forEach((protocol) => {
            expect(() => {
                buildEndpoint().protocol = protocol as any;
            }).toThrowError('Given value is not a valid protocol');
        });
    });

    it('set port should throw for invalid port', () => {
        getInvalidPorts().forEach((port) => {
            expect(() => {
                new Endpoint('localhost', undefined, port as any);
            }).toThrowError('Given value is not a valid port number');
        });
    });
});

describe('Building URL', () => {
    it('toString', () => {
        const parameters = getValidParameters(false);
        const hosts = parameters.hosts;
        const protocols = parameters.protocols;
        const ports = parameters.ports;
        const paths = parameters.paths;

        hosts.forEach(host => {
            protocols.forEach(protocol => {
                ports.forEach(port => {
                    paths.forEach(path => {
                        const url = port
                            ? new URL(`${protocol}//${host}:${port}/${path}/`)
                            : new URL(`${protocol}//${host}/${path}/`)
                        ; // add a trailing slash, because one will be added in Adapter Configuration

                        const configuration = Endpoint.fromUrl(url);
                        expect(configuration.toString()).toEqual(url.toString());
                    });
                });
            });
        });
    });
});
