import 'reflect-metadata';
import { ClassConstructorType } from './ClassConstructorType';
import { ConverterInterface } from './ConverterInterface';

export class Converter<B> implements ConverterInterface<B> {
    /**
     * Convert a single raw object into the target type
     *
     * @param {ClassConstructorType<T>} target
     * @param {object[]} input
     * @return {T[]}
     */
    public convertSingle<T = B>(target: ClassConstructorType<T>, input: object | null): T | null {
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
    public convertCollection<T = B>(target: ClassConstructorType<T>, input: object[]): T[] {
        return Array.prototype.map.call(
            input,
            (item: object) => this.convertSingle(target, item)
        );
    }

    private assignProperty<T>(newInstance: T | object, sourceKey: string, input: object) {
        const targetKey = this.detectPropertyTargetKey(newInstance, sourceKey);
        if (targetKey !== null) {
            const targetType = Reflect.getMetadata('design:type', newInstance, targetKey);
            if (targetType) {
                newInstance[targetKey] = this.convertSingle(targetType, input[sourceKey]);
            } else {
                newInstance[targetKey] = input[sourceKey];
            }
        } else if (typeof console !== 'undefined' && typeof console.warn === 'function') {
            console.warn(`Can not set property "${sourceKey}"`);
        }
    }

    private detectPropertyTargetKey<T>(newInstance: T | object, sourceKey: string) {
        if (newInstance.hasOwnProperty(sourceKey)) {
            return sourceKey;
        } else if (this.hasWriteAccess(newInstance, sourceKey)) {
            return sourceKey;
        } else if (this.hasWriteAccess(newInstance, '_' + sourceKey)) {
            return '_' + sourceKey;
        } else {
            return null;
        }
    }

    private hasWriteAccess<T>(instance: T | object, key: string) {
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
