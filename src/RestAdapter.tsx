import {AdapterInterface} from './AdapterInterface';
import {AdapterConfiguration, FetchCallback} from './AdapterConfiguration';
import {ApiError, buildError} from './Error/ApiError';
import {FetchError} from './Error/FetchError';
import {JsonError} from './Error/JsonError';
import {IdentifierInterface} from './IdentifierInterface';

type ResolveCallback<T> = (value?: T | PromiseLike<T>) => void;
/* tslint:disable-next-line:no-any */
type RejectCallback = (reason?: any) => void;

type SuccessCallback<T> = (result: T, resolve: ResolveCallback<T>, reject: RejectCallback) => void;

export class RestAdapter implements AdapterInterface {
    private readonly config: AdapterConfiguration;

    constructor(config: AdapterConfiguration) {
        this.config = config;
    }

    findAll<T>(resourceType: string): Promise<T[]> {
        const uri = this.buildUri(resourceType);

        return this.configurePromise<T[]>(
            uri,
            this.checkCollectionResult
        );
    }

    findByIdentifier<T>(resourceType: string, identifier: IdentifierInterface): Promise<T | null> {
        this.assertValidIdentifier(identifier);
        const uri = this.buildUri(resourceType) + '/' + identifier;

        return this.configurePromise<T | null>(
            uri,
            this.checkSingleResult
        );
    }

    /**
     * Perform a free request to the given API path
     *
     * @param {string} requestPath
     * @return {Promise<T>}
     */
    execute<T>(requestPath: string): Promise<T> {
        const uri = this.config.endpoint.toString() + requestPath;

        return this.configurePromise<T>(
            uri,
            this.checkExecuteResult
        );
    }

    private configurePromise<T>(
        uri: string,
        successCallback: SuccessCallback<T>
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            return this.fetch(uri)
                .then(response => {
                    if (response.ok) {
                        // If the response is ok try to decode the JSON body
                        try {
                            return response.json();
                        } catch (e) {
                            reject(buildError(JsonError, e));

                            return;
                        }
                    } else {
                        // If there was an error look if a JSON body is given
                        return response
                            .json()
                            .then(errorData => {
                                reject(buildError(FetchError, errorData));
                            })
                            .catch(() => {
                                reject(buildError(FetchError, response));
                            });
                    }
                })
                .then(decodedData => {
                    return successCallback.call(this, decodedData, resolve, reject);
                })
                .catch(e => {
                    reject(buildError(FetchError, e));
                });
        });
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
        result: T | null,
        resolve: ResolveCallback<T | null>,
        reject: RejectCallback
    ) {
        resolve(result);
    }

    private checkCollectionResult<T>(
        result: T[],
        resolve: ResolveCallback<T[]>,
        reject: RejectCallback
    ) {
        if (Array.isArray(result)) {
            resolve(result);
        } else {
            reject(new ApiError('Response was ok, but decoded body is not an array', result));
        }
    }

    private checkExecuteResult<T>(
        result: T,
        resolve: ResolveCallback<T>,
        reject: RejectCallback
    ) {
        resolve(result);
    }
}
