export interface IdentifierInterface {
    toString(): string;
}

export interface AdapterInterface {
    /**
     * Fetch all records of the given `resourceType`
     *
     * @link https://rest.cundd.net/FAQ/#resource-type
     *
     * @param {string} resourceType
     * @return {Promise<Array<object>>}
     */
    findAll<T>(resourceType: string): Promise<T[]>;

    /**
     * Fetch the record with the given `identifier` and `resourceType`
     *
     * @link https://rest.cundd.net/FAQ/#resource-type
     *
     * @param {string} resourceType
     * @param {IdentifierInterface} identifier
     * @return {Promise<object | null>}
     */
    findByIdentifier<T>(resourceType: string, identifier: IdentifierInterface): Promise<T | null>;
}
