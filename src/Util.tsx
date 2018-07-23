export default class Util {
    /**
     * Parse a URL with the help of an A-tag
     *
     * @param {string} href
     * @return {Location}
     */
    static parseUrl(href: string) {
        const aTag = document.createElement("a");
        aTag.href = href;

        return aTag;
    };
}
