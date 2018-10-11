import {ClassConstructorType} from './ClassConstructorType';

export interface ConverterInterface<B> {
    /**
     * Convert a single raw object into the target type
     *
     * @param {object[]} input
     * @param {object[]} input
     * @param {ClassConstructorType<T>} target
     * @return {T[]}
     */
    convertSingle<T = B>(target: ClassConstructorType<T>, input: object | null): T | null;

    /**
     * Convert a collection of raw object's into the target type
     *
     * @param {object[]} input
     * @param {object[]} input
     * @param {ClassConstructorType<T>} target
     * @return {T[]}
     */
    convertCollection<T = B>(target: ClassConstructorType<T>, input: object[]): T[];
}
