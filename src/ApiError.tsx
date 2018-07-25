/* tslint:disable:no-any */
export class ApiError extends Error {
    readonly meta: any | undefined;

    constructor(message: string, meta: any | undefined = undefined) {
        super(message);
        this.meta = meta;
    }
}
