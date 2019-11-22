import { ApiError } from './Error/ApiError';
import { RejectCallback, ResolveCallback } from './RestAdapter';
import { ValidatorInterface } from './ValidatorInterface';

export class Validator implements ValidatorInterface {
    /**
     * Validate the result for the request of a single object
     *
     * @param result
     * @param resolve
     * @param reject
     */
    public validateSingleResult<T>(
        result: T | null,
        resolve: ResolveCallback<T | null>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        reject: RejectCallback
    ): void {
        resolve(result);
    }

    /**
     * Validate the result for the request of multiple objects
     *
     * @param result
     * @param resolve
     * @param reject
     */
    public validateCollectionResult<T>(
        result: T[],
        resolve: ResolveCallback<T[]>,
        reject: RejectCallback
    ): void {
        if (Array.isArray(result) || typeof result === 'object') {
            resolve(result);
        } else {
            reject(new ApiError(`Response was ok, but decoded body is not an array but ${typeof result}`, result));
        }
    }
}
