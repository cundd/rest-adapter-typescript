import 'reflect-metadata';
import { ClassConstructorType } from './ClassConstructorType';
import { ConverterInterface } from './ConverterInterface';
import { ClassTypeDefinition } from './TypeDecorator/ClassLevel';
import { PrimitiveTypeEnum } from './TypeDecorator/PrimitiveTypeEnum';
import { PropertyTypeDefinition } from './TypeDecorator/PropertyTypeDefinition';

export interface LoggerInterface {
    log: (message: string, ...args: any[]) => void;
}

export class Converter<B> implements ConverterInterface<B> {

    constructor(private logger?: LoggerInterface) {

    }

    /**
     * Convert a single raw object into the target type
     *
     * @param {ClassConstructorType<T>} target
     * @param {object | null} input
     * @return {T | null}
     */
    public convertSingle<T = B>(target: ClassConstructorType<T>, input: object | null): T | null {
        return this.convertSingleInput(target, input);
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
    public convertCollection<T = B, I = object[]>(
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
     * Convert a single raw object into the target type
     *
     * @param {ClassConstructorType<T>} target
     * @param {object | null | string} input
     * @return {T | null}
     */
    private convertSingleInput<T = B>(
        target: ClassConstructorType<T>,
        input: object | null | string
    ): T | null {
        if (!input) {
            return null;
        }

        const newInstance = new target(input);
        if (typeof input !== 'string') {
            for (const key of Object.keys(input)) {
                this.assignProperty(newInstance, key, input);
            }
        }

        return newInstance;
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
    private convertArrayCollection<I, T>(target: ClassConstructorType<T>, input: I): T[] {
        return Array.prototype.map.call(
            input,
            (item: object) => this.convertSingleInput(target, item)
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
    private convertObjectCollection<I, T>(target: ClassConstructorType<T>, input: I): Map<string, T> {
        const targetObject: Map<string, T> = new Map();

        Object.keys(input).forEach(
            key => {
                const convertedInstance = this.convertSingleInput(target, input[key]);
                if (convertedInstance) {
                    targetObject.set(key, convertedInstance);
                }
            }
        );
        return targetObject;
    }

    private assignProperty<T>(target: T, sourceKey: string, source: object) {
        const typeDefinition = PropertyTypeDefinition.fromObject<T>(target, sourceKey);

        // Look if there is a Property Type Definition for the source key
        const targetKey = (typeDefinition && typeDefinition.propertyKey)
            ? typeDefinition.propertyKey
            : sourceKey;

        if (typeDefinition) {
            target[targetKey] = this.prepareSourceValue(
                source,
                sourceKey,
                typeDefinition
            );
        } else {
            this.handleSourcePropertyWithoutDefinition(target, sourceKey, source);
        }
    }

    private prepareSourceValue<T>(
        source: object,
        sourceKey: string,
        typeDefinition: PropertyTypeDefinition<T>
    ) {
        const sourceValue = source[sourceKey];

        const type = typeDefinition.type;
        if (type === PrimitiveTypeEnum.Boolean) {
            return !!(sourceValue);
        } else if (type === PrimitiveTypeEnum.Number) {
            return parseFloat(sourceValue);
        } else if (type === PrimitiveTypeEnum.String) {
            return '' + sourceValue;
        } else if (type === PrimitiveTypeEnum.Null) {
            return null;
        } else if (type === PrimitiveTypeEnum.Undefined) {
            return undefined;
        } else if (undefined === type) {
            return sourceValue;
        } else if (typeDefinition.hasMultiple()) {
            return this.convertCollection(type, sourceValue);
        } else {
            return this.convertSingleInput(type, sourceValue);
        }
    }

    /**
     * If no target key could be detected for sourceKey check if there is a PropertyTypeDefinition
     *
     * @param {T} target
     * @param {string} sourceKey
     * @param source
     */
    private handleSourcePropertyWithoutDefinition<T, S>(
        target: T,
        sourceKey: string,
        source: S
    ) {
        const sourceValue = source[sourceKey];
        const classTypeDefinition = ClassTypeDefinition.fromObject(target);

        if (!classTypeDefinition || classTypeDefinition.ignoreUnknownFields()) {
            if (this.logger) {
                this.logger.log(`Property '${sourceKey}' could not be set in '${target.constructor.name}'`);
            }

            return;
        }

        if (classTypeDefinition.denyUnknownFields()) {
            throw new TypeError(`Property '${sourceKey}' could not be found in '${target.constructor.name}'`);
        }

        if (classTypeDefinition.addUnknownFields()) {
            const newTargetKey = this.detectNewPropertyTargetKey(target, sourceKey);
            if (newTargetKey === null) {
                throw new TypeError(`Property '${sourceKey}' could not be set in '${target.constructor.name}'`);
            }

            target[newTargetKey] = sourceValue;
        }
    }

    private detectNewPropertyTargetKey<T>(newInstance: T | object, sourceKey: string) {
        if (this.hasPropertyWriteAccess(newInstance, sourceKey)) {
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
