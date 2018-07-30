import {ClassConstructorType} from './ClassConstructorType';

export interface ConverterInterface<T> {
    /**
     * Convert a single raw object into the target type
     *
     * @param {object[]} input
     * @param {object[]} input
     * @param {ClassConstructorType<T>} target
     * @return {T[]}
     */
    convertSingle(target: ClassConstructorType<T>, input: object | null): T | null;

    /**
     * Convert a collection of raw object's into the target type
     *
     * @param {object[]} input
     * @param {object[]} input
     * @param {ClassConstructorType<T>} target
     * @return {T[]}
     */
    convertCollection(target: ClassConstructorType<T>, input: object[]): T[];
}