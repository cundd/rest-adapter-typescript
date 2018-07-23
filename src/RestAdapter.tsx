import AdapterInterface from "./AdapterInterface";
import AdapterConfiguration from "./AdapterConfiguration";

export default class RestAdapter implements AdapterInterface {
    private readonly config: AdapterConfiguration;

    constructor(config: AdapterConfiguration) {
        this.config = config;
    }

    findAll(resourceType: string): Promise<Array<object>> {
        const x = fetch(this.config.toString());

        console.log(x);

        return new Promise(((resolve, reject) => {
            setTimeout(resolve, 100);
        }));
    }

    findByIdentifier(resourceType: string, identifier: string): Promise<object | null> {
        return new Promise(((resolve, reject) => {

        }));
    }

    // pubf
}
