import 'reflect-metadata';
import { ClassConstructorType } from './ClassConstructorType';
import { ConverterInterface } from './ConverterInterface';
import { TypeDefinition, TypeOptions } from './TypeDecorator';

export class Converter<B extends object> implements ConverterInterface<B> {
    /**
     * Convert a single raw object into the target type
     *
     * @param {ClassConstructorType<T>} target
     * @param {object | null} input
     * @return {T | null}
     */
    public convertSingle<T extends object = B>(target: ClassConstructorType<T>, input: object | null): T | null {
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
     * Convert a collection of input values into instances of the target type
     *
     * If the input value is an array or an empty value, the result will be an array,
     * otherwise a Map will be returned
     *
     * @param {ClassConstructorType<T>} target
     * @param {I} input
     * @return {T[] | Map<string, T>}
     */
    public convertCollection<T extends object = B, I = object[]>(
        target: ClassConstructorType<T>,
        input: I
    ): T[] | Map<string, T> {
        if (Array.isArray(input)) {
            return this.convertArrayCollection(target, input);
        } else if (input) {
            return this.convertObjectCollection(target, input);
        } else {
            return [];
        }
    }

    /**
     * Convert an array of input values into instances of the target type
     *
     * This method is used to convert an input array
     *
     * @param {ClassConstructorType<T>} target
     * @param {I} input
     * @return {T[]}
     */
    private convertArrayCollection<I, T extends object>(target: ClassConstructorType<T>, input: I): T[] {
        return Array.prototype.map.call(
            input,
            (item: object) => this.convertSingle(target, item)
        )
            .filter((i: I) => null !== i);
    }

    /**
     * Convert a collection of raw object's into the target type
     *
     * This method is used to convert a dictionary input into a Map
     *
     * @param {ClassConstructorType<T>} target
     * @param {I} input
     * @return {Map<string, T>}
     */
    private convertObjectCollection<I, T extends object>(target: ClassConstructorType<T>, input: I): Map<string, T> {
        const targetObject: Map<string, T> = new Map();

        Object.keys(input).forEach(
            key => {
                const convertedInstance = this.convertSingle(target, input[key]);
                if (convertedInstance) {
                    targetObject[key] = convertedInstance;
                }
            }
        );
        return targetObject;
    }

    private assignProperty<T extends object>(newInstance: T | object, sourceKey: string, input: object) {
        const targetKey = this.detectPropertyTargetKey(newInstance, sourceKey);
        if (targetKey === null) {
            if (typeof console !== 'undefined' && typeof console.warn === 'function') {
                console.warn(`Can not set property "${sourceKey}"`);
            }
            return;
        }

        const typeDefinition: TypeDefinition<T> = TypeDefinition.fromObject(newInstance, targetKey);
        const sourceValue = input[sourceKey];
        if (!typeDefinition) {
            newInstance[targetKey] = sourceValue;
        } else if (typeDefinition.options & TypeOptions.Multiple) {
            newInstance[targetKey] = this.convertCollection(typeDefinition.type, sourceValue);
        } else {
            newInstance[targetKey] = this.convertSingle(typeDefinition.type, sourceValue);
        }
    }

    private detectPropertyTargetKey<T>(newInstance: T | object, sourceKey: string) {
        if (newInstance.hasOwnProperty(sourceKey)) {
            return sourceKey;
        } else if (this.hasPropertyWriteAccess(newInstance, sourceKey)) {
            return sourceKey;
        } else if (this.hasPropertyWriteAccess(newInstance, '_' + sourceKey)) {
            return '_' + sourceKey;
        } else {
            return null;
        }
    }

    private hasPropertyWriteAccess<T>(instance: T | object, key: string) {
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
