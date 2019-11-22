import { ParDict } from './Dictionary';

export interface EndpointURLInterface {
    hostname: string;
    pathname: string;
    port: string;
    protocol: string;
}

export class Util {
    /**
     * Parse a URL with the help of an A-tag
     *
     * @param {string} href
     * @return {EndpointURLInterface}
     */
    public static parseUrl(href: string): EndpointURLInterface {
        const aTag = document.createElement('a');
        aTag.href = href;

        return aTag;
    }

    /**
     * Return a string representation describing the given input
     *
     * @param {S} input
     * @return {string}
     */
    public static inspectType<S extends ParDict>(input: S): string {
        const type = typeof input;

        if (input === null) {
            return '(object) null';
        }
        if (type === 'object') {
            return '(object) ' + input.constructor.name;
        }

        return '(' + type + ')';
    }

}
