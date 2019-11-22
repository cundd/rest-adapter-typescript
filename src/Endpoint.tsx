import { Credentials } from './Credentials';
import { EndpointInterface } from './EndpointInterface';
import { EndpointURLInterface, Util } from './Util';

/**
 * Object to provide necessary information for an Adapter
 */
export class Endpoint implements EndpointInterface {
    /**
     * Build a new Configuration instance from the given URL
     *
     * @param {string | URL | Location} url
     * @return {Endpoint}
     */
    public static fromUrl(url: string | URL | Location | EndpointURLInterface): Endpoint {
        if (typeof url === 'string') {
            return this.fromUrl(Util.parseUrl(url) as EndpointURLInterface);
        }
        const credentials = url instanceof URL && url.username && url.password
            ? {
                username: url.username,
                password: url.password,
            }
            : undefined;

        return new this(
            url.hostname,
            url.protocol,
            url.port ? parseInt(url.port, 10) : undefined,
            url.pathname,
            credentials
        );
    }

    /**
     * Hostname, IPv4 or IPv6
     */
    private _hostname: string;

    /**
     * Protocol to use
     *
     * Includes a trailing colon (`:`)
     */
    private _protocol: string;

    /**
     * Port number to use
     */
    private _port: number | undefined;

    /**
     * Base path/version for requests
     */
    private _path: string;

    /**
     * Credentials to authenticate with the webservice
     */
    private _credentials: Credentials | undefined;

    /**
     * Create a new Configuration instance
     *
     * @param {string} hostname
     * @param {string} protocol
     * @param {number} port
     * @param {string} path
     * @param {Credentials | undefined} credentials
     */
    constructor(
        hostname: string,
        protocol: string = 'https:',
        port?: number,
        path: string = '',
        credentials?: Credentials
    ) {
        this.assertValidHostname(hostname);
        this.assertValidProtocol(protocol);
        this.assertValidPort(port);
        this._hostname = hostname;
        this._protocol = protocol;
        this._port = this.preparePort(port);
        this._path = this.preparePath(path);
        this._credentials = credentials;
    }

    /**
     * Return the hostname, IPv4 or IPv6
     *
     * @return {string}
     */
    get hostname(): string {
        return this._hostname;
    }

    /**
     * Set the hostname, IPv4 or IPv6
     *
     * @param {string} value
     */
    set hostname(value: string) {
        this.assertValidHostname(value);
        this._hostname = value;
    }

    /**
     * Return the protocol to use
     *
     * Includes a trailing colon (`:`)
     *
     * @return {string}
     */
    get protocol(): string {
        return this._protocol;
    }

    /**
     * Set the protocol to use
     *
     * Includes a trailing colon (`:`)
     *
     * @param {string} value
     */
    set protocol(value: string) {
        this.assertValidProtocol(value);
        this._protocol = value;
    }

    /**
     * Return the port number to use
     *
     * @return {number | undefined}
     */
    get port(): number | undefined {
        return this._port;
    }

    /**
     * Set the port number to use
     *
     * @param {number | undefined} value
     */
    set port(value: number | undefined) {
        this.assertValidPort(value);
        this._port = this.preparePort(value);
    }

    /**
     * Return the base path/version for requests
     *
     * @return {string}
     */
    get path(): string {
        return this._path;
    }

    /**
     * Set the base path/version for requests
     *
     * @param {string} value
     */
    set path(value: string) {
        this._path = this.preparePath(value);
    }

    /**
     * Return the credentials to authenticate with the webservice
     *
     * @return {Credentials | undefined}
     */
    get credentials(): Credentials | undefined {
        return this._credentials;
    }

    /**
     * Set the credentials to authenticate with the webservice
     *
     * @param {Credentials | undefined} value
     */
    set credentials(value: Credentials | undefined) {
        this._credentials = value;
    }

    public toString(): string {
        const portPart = this.hasDefaultPort() ? '' : ':' + this._port;
        const pathPart = this._path === '' ? '/' : this._path;

        return `${this._protocol}//${this._hostname}${portPart}${pathPart}`;
    }

    private preparePort(port: number | string | undefined): number | undefined {
        if (port === undefined) {
            return undefined;
        }

        return parseInt('' + port, 10);
    }

    /**
     * @link https://stackoverflow.com/a/9221063/1552674
     * @param {string} hostname
     */
    private assertValidHostname(hostname: string): void {
        const regex = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))|(^\s*((?=.{1,255}$)(?=.*[A-Za-z].*)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*)\s*$)/;
        if (!hostname || !regex.test(hostname)) {
            throw new TypeError('Given value is not a valid IPv4, IPv6 or hostname');
        }
    }

    private assertValidPort(port: number | string | undefined): void {
        if (undefined === port) {
            return;
        }

        const portAsInt = this.preparePort(port);
        if (!portAsInt || port !== portAsInt || portAsInt < 0 || portAsInt > 65535) {
            throw new TypeError('Given value is not a valid port number' + ' :"' + port + '"');
        }
    }

    private assertValidProtocol(protocol: string): void {
        if (!protocol || protocol.trim() === '') {
            throw new TypeError('Protocol must not be empty');
        }
        if (protocol.substr(-1) !== ':') {
            throw new TypeError('Given value is not a valid protocol. Final colon missing');
        }
        if (['http:', 'https:'].indexOf(protocol) < 0) {
            throw new TypeError('Given value is not a valid protocol');
        }
    }

    private preparePath(path: string): string {
        if ('' === path) {
            return '';
        }
        if ('/' !== path.charAt(0)) {
            return this.preparePath('/' + path);
        }
        if ('/' !== path.charAt(path.length - 1)) {
            return this.preparePath(path + '/');
        }

        return path;
    }

    private hasDefaultPort(): boolean {
        const port = this._port;
        const protocol = this._protocol;

        if (undefined === port) {
            return true;
        }
        if (protocol === 'https:' && port === 443) {
            return true;
        }
        // noinspection RedundantIfStatementJS
        if (protocol === 'http:' && port === 80) {
            return true;
        }

        return false;
    }
}
