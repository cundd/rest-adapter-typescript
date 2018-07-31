import {RejectCallback, ResolveCallback} from './RestAdapter';

export interface ValidatorInterface {
    /**
     * Validate the result for the request of a single object
     *
     * @param result
     * @param resolve
     * @param reject
     */
    validateSingleResult<T>(
        result: T | null,
        resolve: ResolveCallback<T | null>,
        reject: RejectCallback
    ): void;

    /**
     * Validate the result for the request of multiple objects
     *
     * @param result
     * @param resolve
     * @param reject
     */
    validateCollectionResult<T>(
        result: T[],
        resolve: ResolveCallback<T[]>,
        reject: RejectCallback
    ): void;
}
