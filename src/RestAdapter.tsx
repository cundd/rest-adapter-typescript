import AdapterInterface from "./AdapterInterface";
import AdapterConfiguration from "./AdapterConfiguration";

export default class RestAdapter implements AdapterInterface {
    private readonly config: AdapterConfiguration;

    constructor(config: AdapterConfiguration) {
        this.config = config;
    }

    findAll(resourceType: string): Promise<Array<object>> {
        return new Promise(((resolve, reject) => {
            setTimeout(resolve, 100);
        }));
    }

    findByIdentifier(resourceType: string, identifier: string): Promise<object | null> {
        return new Promise(((resolve, reject) => {

        }));
    }

    assertValidResourceType(resourceType: string | any) {
        if (typeof resourceType !== 'string') {
            throw new TypeError(`Resource Type must be of type string "${typeof resourceType}" given`);
        }

        if (resourceType.indexOf('/') > -1) {
            throw new TypeError('Resource Type must not contain a slash');
        }
    }

    pathForResourceType(resourceType: string): string {
        this.assertValidResourceType(resourceType);

        return resourceType
            .replace(/\./, '-')
            .replace(/\.?([A-Z]+)/g, (x, y) => "_" + y.toLowerCase())
            .replace(/^_/, '');
    }
}
