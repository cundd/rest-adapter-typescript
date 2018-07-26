/* tslint:disable:no-any */

export type ErrorInput = Error | string | String | any;
export type ErrorConstructorFn<E> = new (...args: any[]) => E;

function constructError<E extends ApiError>(
    constructorFn: ErrorConstructorFn<E>,
    error: ErrorInput,
    meta: any | undefined
): E {
    if (error instanceof Error) {
        return new constructorFn(error.message, error);
    }

    if (error instanceof String || typeof error === 'string') {
        return new constructorFn('' + error, meta);
    }

    if (typeof error === 'object') {
        if (typeof error['error'] !== 'undefined') {
            // Build an Error using the `error` property and use the input as `meta`

            return constructError(constructorFn, error['error'], error);
        } else if (typeof error['toString'] === 'function') {
            return new constructorFn(error.toString(), error);
        } else if (typeof error['toLocalString'] === 'function') {
            return new constructorFn(error.toLocalString(), error);
        }
    }

    return new constructorFn('Undefined error', error);
}

/**
 * Build an error of the given `constructorFn`
 *
 * @param {ErrorConstructorFn<E extends ApiError>} constructorFn
 * @param {ErrorInput} error
 * @return {E}
 */
export function buildError<E extends ApiError>(
    constructorFn: ErrorConstructorFn<E>,
    error: ErrorInput
): E {
    return constructError(constructorFn, error, undefined);
}

export class ApiError {
    readonly message: string;
    readonly meta: any | undefined;

    constructor(message: string, meta: any | undefined = undefined) {
        this.message = message;
        this.meta = meta;
    }
}
