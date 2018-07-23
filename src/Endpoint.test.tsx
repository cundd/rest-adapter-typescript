import Endpoint from "./Endpoint";

const getValidParameters = function (includeIpv6: boolean) {
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
        hosts: hosts,
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

const trimSlashes = function (input: string) {
    return input.replace(new RegExp('^/+|/+$', 'g'), '');
};

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
                })
            })
        })
    });
});

const fromUrlTest = (buildUrlObject: boolean) => {
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
                })
            })
        })
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
            new Endpoint(host as any);
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
            new Endpoint('localhost', protocol as any);
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
            new Endpoint('localhost', protocol);
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
            new Endpoint('localhost', protocol);
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
            new Endpoint('localhost', undefined, port as any);
        }).toThrowError('Given value is not a valid port number');
    });
});

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
                })
            })
        })
    });
});
