import {AdapterInterface, IdentifierInterface} from './AdapterInterface';
import {AdapterConfiguration, FetchCallback} from './AdapterConfiguration';
import {ApiError} from './ApiError';

type ResolveCallback<T> = (value?: T | PromiseLike<T>) => void;
/* tslint:disable-next-line:no-any */
type RejectCallback = (reason?: any) => void;

export class RestAdapter implements AdapterInterface {
    private readonly config: AdapterConfiguration;

    constructor(config: AdapterConfiguration) {
        this.config = config;
    }

    findAll<T>(resourceType: string): Promise<T[]> {
        const uri = this.buildUri(resourceType);

        return new Promise((resolve, reject) => {
            const promise = this.configurePromise(uri, reject);

            return promise
                .then((result: [Response, T[]]) => {
                    const response = result[0];
                    const decodedData = result[1];

                    this.checkCollectionResult(response, decodedData, resolve, reject);
                });
        });
    }

    findByIdentifier<T>(resourceType: string, identifier: IdentifierInterface): Promise<T | null> {
        this.assertValidIdentifier(identifier);
        const uri = this.buildUri(resourceType) + '/' + identifier;

        return new Promise(((resolve, reject) => {
            const promise = this.configurePromise(uri, reject);

            return promise
                .then((result: [Response, T | null]) => {
                    const response = result[0];
                    const decodedData = result[1];

                    this.checkSingleResult(response, decodedData, resolve, reject);
                });
        }));
    }

    /**
     * Perform a free request to the given API path
     *
     * @param {string} requestPath
     * @return {Promise<T>}
     */
    execute<T>(requestPath: string): Promise<T> {
        const uri = this.config.endpoint.toString() + requestPath;

        return new Promise(((resolve, reject) => {
            const promise = this.configurePromise(uri, reject);

            return promise
                .then((result: [Response, T]) => {
                    const response = result[0];
                    const decodedData = result[1];

                    if (this.checkGeneralResult(response, decodedData, reject)) {
                        resolve(decodedData);
                    }
                });
        }));
    }

    private configurePromise(uri: string, reject: RejectCallback) {
        const responsePromise = this.fetch(uri).catch(reject);
        const decodePromise = responsePromise.then((response: Response) => response.json()).catch(reject);

        return Promise
            .all([responsePromise, decodePromise])
            .catch(reject);
    }

    /* tslint:disable-next-line:no-any */
    private assertValidResourceType(resourceType: string | any) {
        if (typeof resourceType !== 'string') {
            throw new TypeError(`Resource Type must be of type string "${typeof resourceType}" given`);
        }

        if (resourceType.indexOf('/') > -1) {
            throw new TypeError('Resource Type must not contain a slash');
        }
    }

    private assertValidIdentifier(identifier: IdentifierInterface | string) {
        let identifierString;
        if (typeof identifier === 'string') {
            identifierString = identifier;
        }
        if (identifier && (typeof identifier.toString === 'function')) {
            identifierString = identifier.toString();
        } else {
            throw new TypeError(
                'Argument "identifier" must implement IdentifierInterface. ' +
                '"' + (typeof identifier) + '" given'
            );
        }

        if (identifierString.indexOf('/') > -1) {
            throw new TypeError('Identifier must not contain a slash');
        }
    }

    private fetch(uri: string): Promise<Response> {
        const config = this.config;
        const requestSettings = config.requestSettings;
        const fetchCallback: FetchCallback | undefined = config.fetchCallback;

        let xhrPromise;
        if (fetchCallback) {
            // Use the custom fetch callback
            xhrPromise = fetchCallback(uri, requestSettings);
        } else {
            // Use the JavaScript Fetch API (https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
            xhrPromise = fetch(uri, requestSettings);
        }

        return xhrPromise;
    }

    private buildUri(resourceType: string): string {
        return this.config.endpoint.toString() + this.pathForResourceType(resourceType);
    }

    private pathForResourceType(resourceType: string): string {
        this.assertValidResourceType(resourceType);

        return resourceType
            .replace(/_?([A-Z]+)/g, (x, y) => '_' + y.toLowerCase())
            .replace(/\./, '-')
            .replace(/-_/g, '-')
            .replace(/^_/, '');
    }

    private checkSingleResult<T>(
        response: Response,
        result: T | null,
        resolve: ResolveCallback<T | null>,
        reject: RejectCallback
    ) {
        if (this.checkGeneralResult(response, result, reject)) {
            resolve(result);
        }
    }

    private checkCollectionResult<T>(
        response: Response,
        result: T[],
        resolve: ResolveCallback<T[]>,
        reject: RejectCallback
    ) {
        if (this.checkGeneralResult(response, result, reject)) {
            if (Array.isArray(result)) {
                resolve(result);
            } else {
                reject(new ApiError('Response was ok, but decoded body is not an array', result));
            }
        }
    }

    private checkGeneralResult<T>(
        response: Response,
        decodedData: T[] | T | null,
        reject: RejectCallback
    ): boolean {
        if (response && response.ok) {
            return true;
        }

        if (!decodedData) {
            reject();
        } else if (decodedData['error']) {
            reject(new ApiError(decodedData['error'], decodedData));
        } else {
            reject(decodedData);
        }

        return false;
    }
}
