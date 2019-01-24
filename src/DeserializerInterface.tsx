import { ClassConstructorType } from './ClassConstructorType';
import { SerializationResult } from './SerializationResult';

export type DeserializerResult<T> = SerializationResult<T> ;

export interface DeserializerInterface<B> {
    /**
     * Convert a input JSON-string into the target type
     *
     * @param {ClassConstructorType<T>} target
     * @param {object | null} input
     * @return {T | null}
     */
    deserialize<T = B, R = DeserializerResult<T>>(target: ClassConstructorType<T>, input: string): R;
}
