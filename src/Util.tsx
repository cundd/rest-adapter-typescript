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
    static parseUrl(href: string): EndpointURLInterface {
        const aTag = document.createElement('a');
        aTag.href = href;

        return aTag;
    }
}
