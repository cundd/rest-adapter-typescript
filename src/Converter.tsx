import 'reflect-metadata';
import { ClassConstructorType } from './ClassConstructorType';
import { CollectionType } from './CollectionType';
import { ConverterInterface } from './ConverterInterface';
import { Dictionary, ParDict } from './Dictionary';
import { ConverterTypeError } from './Error/ConverterTypeError';
import { LoggerInterface } from './LoggerInterface';
import { PrimitiveType } from './PrimitiveType';
import { ClassTypeDefinition } from './TypeDecorator/ClassLevel';
import { isNotPrimitive, PrimitiveTypeEnum } from './TypeDecorator/PrimitiveTypeEnum';
import { PropertyTypeDefinition } from './TypeDecorator/PropertyTypeDefinition';
import { Util } from './Util';

type MapFunctionResult<R> = R | undefined | null | any;

function map<T, R, I = T[] | any>(collection: I, cb: (item: T) => MapFunctionResult<R>): MapFunctionResult<R>[] {
    return Array.prototype.map.call(collection, cb as any) as MapFunctionResult<R>;
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
    private convertSingleInput<T = B, I = Partial<Dictionary<T>>>(
        target: ClassConstructorType<T>,
        input: I
    ): T | null {
        if (!input) {
            return null;
        }

        if (isNotPrimitive(input)) {
            // Create an instance without calling `new`
            const newInstance = Object.create(target.prototype);
            for (const key of Object.keys(input)) {
                this.assignProperty(newInstance, key, input);
            }

            if (typeof newInstance['postConstruct'] === 'function') {
                newInstance['postConstruct']();
            }

            return newInstance;
        } else {
            return new target(input);
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
    private convertArrayCollection<I, T>(target: ClassConstructorType<T>, input: I): T[] {
        return map(input, (item: object) => this.convertSingleInput(target, item))
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
    private convertObjectCollection<I extends Partial<Dictionary<T>>, T>(
        target: ClassConstructorType<T>,
        input: I
    ): Map<string, T> {
        const targetObject: Map<string, T> = new Map();

        if (typeof input !== 'object') {
            throw new ConverterTypeError(`Argument 'input' must be an object, '${typeof input}' given`);
        }
        Object.keys(input).forEach(
            key => {
                const inputValue = input[key];
                const convertedInstance = this.convertSingleInput(target, inputValue);
                if (convertedInstance) {
                    targetObject.set(key, convertedInstance);
                }
            }
        );
        return targetObject;
    }

    private assignProperty<T extends ParDict>(target: T, sourceKey: string, source: object): void {
        const typeDefinition = PropertyTypeDefinition.fromObject<T>(target, sourceKey);

        // Look if there is a Property Type Definition for the source key
        const targetKey = (typeDefinition && typeDefinition.propertyKey)
            ? typeDefinition.propertyKey
            : sourceKey;

        if (typeDefinition) {
            (target as ParDict)[targetKey] = this.prepareSourceValue(
                source,
                sourceKey,
                typeDefinition
            );
        } else {
            this.handleSourcePropertyWithoutDefinition(target, sourceKey, source);
        }
    }

    private prepareSourceValue<T, S extends ParDict>(
        source: S,
        sourceKey: string,
        typeDefinition: PropertyTypeDefinition<T>
    ): PrimitiveType | CollectionType<T> | T {
        const sourceValue = source[sourceKey];

        // Handle `null` or `undefined`
        if (sourceValue === null || sourceValue === undefined) {
            return sourceValue;
        }

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
    private handleSourcePropertyWithoutDefinition<T extends ParDict, S extends ParDict>(
        target: T,
        sourceKey: string,
        source: S
    ): void {
        const sourceValue = source[sourceKey];
        const classTypeDefinition = ClassTypeDefinition.fromObject(target);

        if (!classTypeDefinition || classTypeDefinition.ignoreUnknownFields()) {
            if (this.logger) {
                const message = `Property '${sourceKey}' could not be set in '${target.constructor.name}': `;
                if (!classTypeDefinition) {
                    this.logger.log(message + 'No class type definition found');
                } else if (!classTypeDefinition.ignoreUnknownFields()) {
                    this.logger.log(message + 'Unknown fields are ignored');
                }
            }

            return;
        }

        if (classTypeDefinition.denyUnknownFields()) {
            throw new ConverterTypeError(`Property '${sourceKey}' could not be found in '${Util.inspectType(target)}'`);
        }

        if (classTypeDefinition.addUnknownFields()) {
            const newTargetKey = this.detectNewPropertyTargetKey(target, sourceKey);
            if (newTargetKey === null) {
                throw new ConverterTypeError(`Property '${sourceKey}' could not be set in '${Util.inspectType(target)}'`);
            }

            (target as ParDict)[newTargetKey] = sourceValue;
        }
    }

    private detectNewPropertyTargetKey<T extends object>(newInstance: T | object, sourceKey: string): string | null {
        if (this.hasPropertyWriteAccess(newInstance, sourceKey)) {
            return sourceKey;
        } else if (this.hasPropertyWriteAccess(newInstance, '_' + sourceKey)) {
            return '_' + sourceKey;
        } else {
            return null;
        }
    }

    private hasPropertyWriteAccess<T extends object>(instance: T | object, key: string): boolean {
        const descriptor = Object.getOwnPropertyDescriptor(instance, key)
            || Object.getOwnPropertyDescriptor((instance as object).constructor.prototype, key);
        if (!descriptor) {
            return true;
        }
        // noinspection RedundantIfStatementJS
        if (descriptor.get && !descriptor.set) {
            return false;
        }

        return true;
    }
}
