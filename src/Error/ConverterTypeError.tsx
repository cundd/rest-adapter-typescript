export class ConverterTypeError extends TypeError {
    public readonly meta?: any;

    constructor(message?: string, meta?: any) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.meta = meta;
    }
}
