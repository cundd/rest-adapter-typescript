import AdapterInterface from "./AdapterInterface";
import AdapterConfiguration from "./AdapterConfiguration";

export default class RestAdapter implements AdapterInterface {
    private readonly config: AdapterConfiguration;

    constructor(config: AdapterConfiguration) {
        this.config = config;
    }

    findAll(resourceType: string): Array<object> {
        return [];
    }

    findByIdentifier(resourceType: string, identifier: string): object | null {
        return null;
    }
}
