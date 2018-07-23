import Endpoint from "./Endpoint";

/**
 * Object to provide necessary information for an Adapter
 */
export default class AdapterConfiguration {
    /**
     * API endpoint information
     */
    endpoint: Endpoint;

    /**
     * Build a new Configuration instance from the given URL
     *
     * @param {URL | Location} url
     * @return {AdapterConfiguration}
     */
    static fromUrl(url: string | URL | Location): AdapterConfiguration {
        return new this(Endpoint.fromUrl(url));
    }

    /**
     * Create a new Configuration instance
     *
     * @param {Endpoint} endpoint
     */
    constructor(endpoint: Endpoint) {
        this.endpoint = endpoint;
    }

    /**
     * Return the hostname, IPv4 or IPv6
     *
     * @return {string}
     */
    get hostname(): string {
        return this.endpoint.hostname;
    }

    /**
     * Return the protocol to use
     *
     * Includes a trailing colon (`:`)
     *
     * @return {string}
     */
    get protocol(): string {
        return this.endpoint.protocol;
    }

    /**
     * Return the port number to use
     *
     * @return {number | undefined}
     */
    get port(): number | undefined {
        return this.endpoint.port;
    }

    /**
     * Return the base path/version for requests
     *
     * @return {string}
     */
    get path(): string {
        return this.endpoint.path;
    }
}
