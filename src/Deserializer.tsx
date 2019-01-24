import { ClassConstructorType } from './ClassConstructorType';
import { Converter } from './Converter';
import { DeserializerInterface, DeserializerResult } from './DeserializerInterface';
import { SerializationError } from './Error/SerializationError';

export class Deserializer<B> implements DeserializerInterface<B> {
    private readonly _converter: Converter<B>;

    constructor(converter?: Converter<B>) {
        this._converter = converter || new Converter<B>();
    }

    public deserialize<T = B, R = DeserializerResult<T>>(target: ClassConstructorType<T>, input: string): R {
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
            return (converter.convertCollection(target, raw) as any) as R;
        } else {
            const result = converter.convertSingle(target, raw);
            if (result === null) {
                throw new SerializationError('Could not convert input', {input});
            }
            return (result as any) as R;
        }
    }
}
