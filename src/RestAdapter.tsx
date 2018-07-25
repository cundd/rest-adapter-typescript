import {AdapterInterface, IdentifierInterface} from './AdapterInterface';
import {AdapterConfiguration, FetchCallback} from './AdapterConfiguration';

export class RestAdapter implements AdapterInterface {
    private readonly config: AdapterConfiguration;

    constructor(config: AdapterConfiguration) {
        this.config = config;
    }

    findAll<T>(resourceType: string): Promise<T[]> {
        const uri = this.buildUri(resourceType);

        return new Promise(((resolve, reject) => {
            this.fetch<T>(uri)
                .then((foundInstances: T[]) => {
                    resolve(foundInstances);
                })
                .catch(reason => {
                    reject(reason);
                });
        }));
    }

    findByIdentifier<T>(resourceType: string, identifier: IdentifierInterface): Promise<T | null> {
        this.assertValidIdentifier(identifier);
        const uri = this.buildUri(resourceType) + '/' + identifier;

        return new Promise(((resolve, reject) => {
            this.fetch<T>(uri)
                .then((foundInstance: T | null) => {
                    resolve(foundInstance);
                })
                .catch(reason => {
                    reject(reason);
                });
        }));
    }

    /* tslint:disable-next-line:no-any */
    assertValidResourceType(resourceType: string | any) {
        if (typeof resourceType !== 'string') {
            throw new TypeError(`Resource Type must be of type string "${typeof resourceType}" given`);
        }

        if (resourceType.indexOf('/') > -1) {
            throw new TypeError('Resource Type must not contain a slash');
        }
    }

    assertValidIdentifier(identifier: IdentifierInterface | string) {
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

    // fetch(uri: string): Promise<any> {
    fetch<T>(uri: string): Promise<T[] | T | null> {
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

        return xhrPromise.then((response: Response) => {
            return response.json();
        });
    }

    buildUri(resourceType: string): string {
        return this.config.endpoint.toString() + this.pathForResourceType(resourceType);
    }

    pathForResourceType(resourceType: string): string {
        this.assertValidResourceType(resourceType);

        return resourceType
            .replace(/_?([A-Z]+)/g, (x, y) => '_' + y.toLowerCase())
            .replace(/\./, '-')
            .replace(/-_/g, '-')
            .replace(/^_/, '');
    }
}
