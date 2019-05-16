import { AdapterConfiguration, FetchCallback } from './AdapterConfiguration';
import { AdapterExecuteInterface } from './AdapterExecuteInterface';
import { AdapterInterface } from './AdapterInterface';
import { buildError } from './Error/ApiError';
import { FetchError } from './Error/FetchError';
import { JsonError } from './Error/JsonError';
import { ExecuteMethod } from './ExecuteMethod';
import { IdentifierInterface } from './IdentifierInterface';
import { Validator } from './Validator';
import { ValidatorInterface } from './ValidatorInterface';

export type ResolveCallback<T> = (value?: T | PromiseLike<T>) => void;
/* tslint:disable-next-line:no-any */
export type RejectCallback = (reason?: any) => void;

type SuccessCallback<T> = (result: T, resolve: ResolveCallback<T>, reject: RejectCallback) => void;

export class RestAdapter implements AdapterInterface, AdapterExecuteInterface {
    private readonly config: AdapterConfiguration;
    private readonly validator: ValidatorInterface;

    constructor(config: AdapterConfiguration) {
        this.config = config;
        this.validator = new Validator();
    }

    public findAll<T>(resourceType: string): Promise<T[]> {
        const uri = this.buildUri(resourceType);

        return this.configureGetPromise<T[]>(
            uri,
            this.checkCollectionResult
        );
    }

    public findByIdentifier<T>(resourceType: string, identifier: IdentifierInterface): Promise<T | null> {
        this.assertValidIdentifier(identifier);
        const uri = this.buildUri(resourceType) + '/' + identifier;

        return this.configureGetPromise<T | null>(
            uri,
            this.checkSingleResult
        );
    }

    /**
     * Send a POST request to the given Resource Type
     *
     * @param resourceType
     * @param body
     */
    public post<I, R = I>(resourceType: string, body: I): Promise<R> {
        const uri = this.buildUri(resourceType);

        return this.configurePostPromise<I, R>(
            uri,
            body,
            this.checkPostResult
        );
    }

    /**
     * Perform a GET or POST request to the given API path
     *
     * @param {string} requestPath
     * @param {string} method
     * @param {I} body
     * @return {Promise<R>}
     */
    public execute<I, R extends object = {}>(
        requestPath: string,
        method: ExecuteMethod = ExecuteMethod.GET,
        body?: I
    ): Promise<R> {
        const uri = this.config.endpoint.toString() + requestPath;

        if (method === 'GET') {
            return this.configureGetPromise<R>(
                uri,
                this.checkExecuteResult
            );
        } else if (method === 'POST') {
            if (arguments.length < 3) {
                throw new ReferenceError('Missing request body');
            }

            return this.configurePostPromise<I, R>(
                uri,
                body as I,
                this.checkExecuteResult
            );
        } else {
            throw new TypeError(`Method '${method}' is not implemented`);
        }
    }

    private configureGetPromise<T>(
        uri: string,
        successCallback: SuccessCallback<T>
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            return this.sendGet(uri)
                .then(this.buildResponseCheck(reject))
                .then(decodedData => {
                    return successCallback.call(this, decodedData, resolve, reject);
                })
                .catch(e => {
                    reject(buildError(FetchError, e));
                });
        });
    }

    private configurePostPromise<T, R>(
        uri: string,
        body: T,
        successCallback: SuccessCallback<R>
    ): Promise<R> {
        return new Promise((resolve, reject) => {
            return this.sendPost(uri, body)
                .then(this.buildResponseCheck(reject))
                .then(decodedData => {
                    return successCallback.call(this, decodedData, resolve, reject);
                })
                .catch(e => {
                    reject(buildError(FetchError, e));
                });
        });
    }

    private buildResponseCheck(reject: RejectCallback) {
        return (response: Response) => {
            if (response.ok) {
                // If the response is ok try to decode the JSON body
                try {
                    return response.json();
                } catch (e) {
                    reject(buildError(JsonError, e));

                    return undefined;
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
        };
    }

    /* tslint:disable-next-line:no-any */
    private assertValidResourceType(resourceType: string | any) {
        if (typeof resourceType !== 'string') {
            throw new TypeError(`Resource Type must be of type string "${typeof resourceType}" given`);
        }

        // if (resourceType.indexOf('/') > -1) {
        //     throw new TypeError('Resource Type must not contain a slash');
        // }
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

    private sendGet(uri: string): Promise<Response> {
        return this.fetch(uri, this.config.requestSettings);
    }

    private sendPost<T>(uri: string, body: T): Promise<Response> {
        const config = this.config;

        const requestSettings = Object.assign(
            {},
            {
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: typeof body !== 'string' ? JSON.stringify(body) : body
            },
            config.requestSettings
        );
        return this.fetch(uri, requestSettings);
    }

    private fetch(uri: string, requestSettings: RequestInit) {
        const fetchCallback: FetchCallback | undefined = this.config.fetchCallback;

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
        this.validator.validateSingleResult(result, resolve, reject);
    }

    private checkCollectionResult<T>(
        result: T[],
        resolve: ResolveCallback<T[]>,
        reject: RejectCallback
    ) {
        this.validator.validateCollectionResult(result, resolve, reject);
    }

    private checkExecuteResult<T>(
        result: T,
        resolve: ResolveCallback<T>,
        reject: RejectCallback
    ) {
        this.validator.validateSingleResult(result, resolve as ResolveCallback<T | null>, reject);
    }

    private checkPostResult<T>(
        result: T,
        resolve: ResolveCallback<T>,
        reject: RejectCallback
    ) {
        this.validator.validateSingleResult(result, resolve as ResolveCallback<T | null>, reject);
    }
}
