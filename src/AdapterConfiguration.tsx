import { Endpoint } from './Endpoint';
import { EndpointInterface } from './EndpointInterface';

export type FetchCallback = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

/**
 * Object to provide necessary information for an Adapter
 */
export class AdapterConfiguration {
    /**
     * Build a new Configuration instance from the given URL
     *
     * @param {URL | Location} url
     * @param {RequestInit} requestSettings
     * @return {AdapterConfiguration}
     */
    public static fromUrl(url: string | URL | Location, requestSettings: RequestInit = {}): AdapterConfiguration {
        return new this(Endpoint.fromUrl(url), requestSettings);
    }

    /**
     * API endpoint information
     */
    public endpoint: EndpointInterface;

    /**
     * Settings that are forwarded to the fetch callback
     *
     * @link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters
     */
    public requestSettings: RequestInit;

    /**
     * Method to use to make XHR requests
     */
    private _fetchCallback: FetchCallback | undefined;

    /**
     * Create a new Configuration instance
     *
     * `fetchCallback` can be used to provide a custom function which will perform the XHR requests.
     * If none is given [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) will be used
     *
     * @param {EndpointInterface} endpoint
     * @param {RequestInit} requestSettings
     * @param {FetchCallback} fetchCallback
     */
    constructor(
        endpoint: EndpointInterface,
        requestSettings: RequestInit = {},
        fetchCallback?: FetchCallback
    ) {
        this.requestSettings = requestSettings;
        this.fetchCallback = fetchCallback;
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

    /**
     * Return the method to use to make XHR requests
     *
     * @return {FetchCallback | undefined}
     */
    get fetchCallback(): FetchCallback | undefined {
        return this._fetchCallback;
    }

    /**
     * Set the method to use to make XHR requests
     *
     * @param {FetchCallback | undefined} fetchCallback
     */
    set fetchCallback(fetchCallback: FetchCallback | undefined) {
        if (fetchCallback !== undefined && typeof fetchCallback !== 'function') {
            throw new TypeError(
                'Argument "fetchCallback" must either be `undefined` or a function returning a Promise'
            );
        }
        this._fetchCallback = fetchCallback;
    }
}
