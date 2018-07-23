export default interface AdapterInterface {
    /**
     * Fetch all records of the given `resourceType`
     *
     * @link https://rest.cundd.net/FAQ/#resource-type
     *
     * @param {string} resourceType
     * @return {Array<object>}
     */
    findAll(resourceType: string): Array<object>;

    /**
     * Fetch the record with the given `identifier` and `resourceType`
     *
     * @link https://rest.cundd.net/FAQ/#resource-type
     *
     * @param {string} resourceType
     * @param {string} identifier
     * @return {object | null}
     */
    findByIdentifier(resourceType: string, identifier: string): object | null;
}
