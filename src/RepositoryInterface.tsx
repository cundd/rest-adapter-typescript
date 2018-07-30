import {IdentifierInterface} from './IdentifierInterface';

export interface RepositoryInterface<T> {
    /**
     * Fetch all records of the repository's type
     *
     * @return {Promise<Array<object>>}
     */
    findAll(): Promise<T[]>;

    /**
     * Fetch the record with the given `identifier`
     *
     * @param {IdentifierInterface} identifier
     * @return {Promise<object | null>}
     */
    findByIdentifier(identifier: IdentifierInterface): Promise<T | null>;
}
