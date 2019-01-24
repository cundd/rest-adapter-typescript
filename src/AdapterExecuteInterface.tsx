// tslint:disable:unified-signatures

import { ExecuteMethod } from './ExecuteMethod';

export interface AdapterExecuteInterface {
    /**
     * Perform a GET request to the given API path
     *
     * @param {string} requestPath
     * @return {Promise<R>}
     */
    execute<R>(requestPath: string): Promise<R>;

    /**
     * Perform a POST request to the given API path
     *
     * @param {string} requestPath
     * @param {string} method
     * @param {I} body
     * @return {Promise<R>}
     */
    execute<I, R = I>(requestPath: string, method: ExecuteMethod.POST, body: I): Promise<R>;

    /**
     * Perform a GET or POST request to the given API path
     *
     * @param {string} requestPath
     * @param {string} method
     * @param {I} body
     * @return {Promise<R>}
     */
    execute<I, R extends object = {}>(requestPath: string, method?: ExecuteMethod, body?: I | undefined): Promise<R>;
}
