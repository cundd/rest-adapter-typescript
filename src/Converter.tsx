import {ClassConstructorType} from './ClassConstructorType';
import {ConverterInterface} from './ConverterInterface';

export class Converter<T> implements ConverterInterface<T> {
    /**
     * Convert a single raw object into the target type
     *
     * @param {ClassConstructorType<T>} target
     * @param {object[]} input
     * @return {T[]}
     */
    public convertSingle(target: ClassConstructorType<T>, input: object | null): T | null {
        if (!input) {
            return null;
        }

        const newInstance = new target(input);
        for (const key of Object.keys(input)) {
            this.assignProperty(newInstance, key, input);
        }

        return newInstance;
    }

    /**
     * Convert a collection of raw object's into the target type
     *
     * @param {ClassConstructorType<T>} target
     * @param {object[]} input
     * @return {T[]}
     */
    public convertCollection(target: ClassConstructorType<T>, input: object[]): T[] {
        return Array.prototype.map.call(
            input,
            (item: object) => this.convertSingle(target, item)
        );
    }

    private assignProperty(newInstance: T | object, key: string, input: object) {
        if (newInstance.hasOwnProperty(key)) {
            newInstance[key] = input[key];
        } else if (this.hasWriteAccess(newInstance, key)) {
            newInstance[key] = input[key];
        } else if (this.hasWriteAccess(newInstance, '_' + key)) {
            newInstance['_' + key] = input[key];
        } else {
            if (typeof console !== 'undefined' && typeof console.warn === 'function') {
                console.warn(`Can not set property "${key}"`);
            }
        }
    }

    private hasWriteAccess(instance: T | object, key: string) {
        const descriptor = Object.getOwnPropertyDescriptor(instance, key)
            || Object.getOwnPropertyDescriptor(instance.constructor.prototype, key);
        if (!descriptor) {
            return true;
        }
        if (descriptor.get && !descriptor.set) {
            return false;
        }

        return true;
    }
}
