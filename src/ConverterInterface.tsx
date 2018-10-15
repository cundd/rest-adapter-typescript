import { ClassConstructorType } from './ClassConstructorType';

export interface ConverterInterface<B extends object> {
    /**
     * Convert a single raw object into the target type
     *
     * @param {ClassConstructorType<T>} target
     * @param {object | null} input
     * @return {T | null}
     */
    convertSingle<T extends object = B>(target: ClassConstructorType<T>, input: object | null): T | null;

    /**
     * Convert a collection of input values into instances of the target type
     *
     * If the input value is an array or an empty value, the result will be an array,
     * otherwise a Map will be returned
     *
     * @param {ClassConstructorType<T>} target
     * @param {I} input
     * @return {T[] | Map<string, T>}
     */

    convertCollection<T extends object = B, I = object[]>(
        target: ClassConstructorType<T>,
        input: I
    ): T[] | Map<string, T>;
}
