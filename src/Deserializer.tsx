import { ClassConstructorType } from './ClassConstructorType';
import { Converter } from './Converter';
import { DeserializerInterface, DeserializerResult } from './DeserializerInterface';
import { SerializationError } from './Error/SerializationError';

export class Deserializer<B> implements DeserializerInterface<B> {
    private readonly _converter: Converter<B>;

    constructor(converter?: Converter<B>) {
        this._converter = converter || new Converter<B>();
    }

    public deserialize<T = B>(target: ClassConstructorType<T>, input: string): DeserializerResult<T> {
        if (!input) {
            throw new SerializationError('Input must not be empty', {input});
        }
        // noinspection SuspiciousTypeOfGuard
        if (typeof input !== 'string' && !((input as any) instanceof String)) {
            throw new SerializationError('Input must be of type string', {input});
        }
        let raw;
        try {
            raw = JSON.parse(input);
        } catch (error) {
            throw new SerializationError(error.message + ' ' + input, {error, input});
        }
        const converter = this._converter;

        if (input.charAt(0) === '[') {
            return converter.convertCollection(target, raw);
        } else {
            const result = converter.convertSingle(target, raw);
            if (result === null) {
                throw new SerializationError('Could not convert input', {input});
            }
            return result;
        }
    }
}
