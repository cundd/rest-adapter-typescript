import { ExecuteMethod } from './ExecuteMethod';

type Result<T> = Promise<T[] | Map<string, T> | T | null>;

export interface RepositoryExecuteInterface<T> {
    /**
     * Perform a GET request to the given resource sub-path and convert the result into models
     *
     * @param {string} subPath
     * @return {Promise<T>}
     */
    execute(subPath: string): Result<T>;

    /**
     * Perform a GET request to the given resource sub-path and convert the result into models
     *
     * @param {string} subPath
     * @param {ExecuteMethod} method
     * @param {I} body
     * @return {Promise<T>}
     */
    execute<I>(subPath: string, method: ExecuteMethod.POST, body: I): Result<T>;

    /**
     * Perform a GET request to the given resource sub-path and convert the result into models
     *
     * @param {string} subPath
     * @param {ExecuteMethod} method
     * @param {I} body
     * @return {Promise<T>}
     */
    execute<I>(subPath: string, method?: ExecuteMethod, body?: I | undefined): Result<T>;
}
