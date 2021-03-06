import 'reflect-metadata';
import { CollectionType } from './CollectionType';
import { ParDict } from './Dictionary';
import { SerializationError } from './Error/SerializationError';
import { LoggerInterface } from './LoggerInterface';
import { PrimitiveType } from './PrimitiveType';
import { SerializerInput, SerializerInterface } from './SerializerInterface';
import { ClassTypeDefinition } from './TypeDecorator/ClassLevel';
import { isPrimitiveTypeEnum, PrimitiveTypeEnum, typeNameForEnum } from './TypeDecorator/PrimitiveTypeEnum';
import { PropertyTypeDefinition } from './TypeDecorator/PropertyTypeDefinition';
import { Util } from './Util';

const replacer = (key: string, value: any): any => value === undefined ? null : value;

export interface FormatOptions {
    /**
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_space_argument
     */
    space: string | number | undefined;
}

export class Serializer<B extends object> implements SerializerInterface<B> {
    constructor(private logger?: LoggerInterface, private formatOptions: FormatOptions = {space: undefined}) {
    }

    public serialize<T extends object = B>(input: SerializerInput<T> | null): string {
        const formatOptions = this.formatOptions;

        if (Array.isArray(input) || input instanceof Map) {
            return JSON.stringify(this.prepareFromCollection(input, undefined), replacer, formatOptions.space);
        } else if (input !== null) {
            return JSON.stringify(this.convertSingleInput(input), replacer, formatOptions.space);
        } else {
            return JSON.stringify(null);
        }
    }

    /**
     * Convert a collection of input objects into a single object that can be serialized
     *
     * @param {T[] | Map<string, T> | Map<number, T>} input
     * @param collectionTypeDefinition
     * @return {object}
     */
    private prepareFromCollection<T = B>(
        input: CollectionType<T>,
        collectionTypeDefinition: PropertyTypeDefinition<T> | undefined
    ): object {
        if (Array.isArray(input)) {
            return this.convertArrayCollection(input, collectionTypeDefinition);
        } else if (input instanceof Map) {
            return this.convertMap(input, collectionTypeDefinition);
        } else {
            return this.convertObjectCollection(input, collectionTypeDefinition);
        }
    }

    /**
     * Convert a single object into an object that can be serialized
     *
     * @param {T} input
     * @return {object|null}
     */
    private convertSingleInput<T extends object = B>(input: T): object | null {
        return this.convertValue(input, undefined);
    }

    /**
     * Convert a single object into an object that can be serialized
     *
     * @param {T} input
     * @param typeDefinition
     * @return {any}
     */
    private convertValue<T>(
        input: T,
        typeDefinition: PropertyTypeDefinition<T> | undefined
    ): any {
        // If the Type Definition is given and it is a primitive type treat the value as it
        if (typeDefinition && isPrimitiveTypeEnum(typeDefinition.type)) {
            return this.preparePrimitiveProperty(input, typeDefinition.type);
        }

        // If the input is not some kind of primitive type it must be an object
        this.assertObject(input);
        if (input instanceof Date) {
            return input;
        }
        if (input === null) {
            return null;
        }

        const target = {};
        for (const key of Object.keys(input)) {
            this.serializeProperty(target, key, input);
        }

        return target;
    }

    /**
     * Convert an array of input objects into an array of objects that can be serialized
     *
     * This method is used to convert an input array
     *
     * @param {T[]} input
     * @param {PropertyTypeDefinition<T> | undefined} collectionTypeDefinition
     * @return {any[]}
     */
    private convertArrayCollection<T>(
        input: T[],
        collectionTypeDefinition: PropertyTypeDefinition<T> | undefined
    ): any[] {
        return Array.prototype.map.call(input, (item: T) => this.convertValue(item, collectionTypeDefinition));
    }

    /**
     * Convert a Map of input objects into a single object that can be serialized
     *
     * This method is used to convert a dictionary or Map
     *
     * @param {Map<number | string, T>} input
     * @param {PropertyTypeDefinition<T> | undefined} collectionTypeDefinition
     * @return {ParDict}
     */
    private convertMap<T>(
        input: Map<number | string, T>,
        collectionTypeDefinition: PropertyTypeDefinition<T> | undefined
    ): ParDict {
        const targetObject: ParDict = {};

        input.forEach(
            (value, key) => {
                targetObject[key] = this.convertValue(value, collectionTypeDefinition);
            }
        );

        return targetObject;
    }

    /**
     * Convert a collection of input objects into a single object that can be serialized
     *
     * This method is used to convert a dictionary or Map
     *
     * @param {T} input
     * @param {PropertyTypeDefinition<T> | undefined} typeDefinition
     * @return {ParDict}
     */
    private convertObjectCollection<T extends ParDict>(
        input: T,
        typeDefinition: PropertyTypeDefinition<T> | undefined
    ): ParDict {
        const targetObject: ParDict = {};

        this.assertObject(input);
        Object.keys(input).forEach(
            key => {
                targetObject[key] = this.convertValue(input[key], typeDefinition);
            }
        );

        return targetObject;
    }

    private serializeProperty<T extends ParDict, C extends ParDict>(
        target: T,
        property: string,
        instance: C
    ): void {
        const typeDefinition = PropertyTypeDefinition.fromObject<C>(instance, property);
        if (!typeDefinition) {
            this.handleSourcePropertyWithoutDefinition(target, property, instance);

            return;
        }

        const logger = this.logger;
        if (typeDefinition.noSerialization()) {
            if (logger) {
                logger.debug(`[Serializer] Property '${property}' marked to prevent serialization`);
            }
            return;
        }

        // Look if there is a Property Type Definition for the property
        let targetKey: string;
        if (typeDefinition.rename) {
            targetKey = typeDefinition.rename;
            if (logger) {
                logger.debug(`[Serializer] Rename '${property}' to '${targetKey}'`);
            }
        } else {
            targetKey = property;
        }

        const prepared = this.prepareProperty(
            instance[property],
            property,
            typeDefinition
        );

        if (logger) {
            logger.debug(
                `[Serializer] Serialize property '${property}' `
                + `of type '${Util.inspectType(instance[property])}' `
                + `to type '${Util.inspectType(prepared)}'`
            );
        }

        (target as ParDict)[targetKey] = prepared;
    }

    private prepareProperty<T>(
        value: T | CollectionType<T>,
        key: string,
        typeDefinition: PropertyTypeDefinition<T>
    ): any {
        const type = typeDefinition.type;

        // Handle `null` or `undefined`
        if (value === null || value === undefined) {
            return value;
        }

        try {
            if (typeDefinition.hasMultiple()) {
                return this.prepareFromCollection(value as CollectionType<T>, typeDefinition);
            }
        } catch (error) {
            if (error instanceof SerializationError) {
                throw new SerializationError(
                    `Error while serializing value for key '${key}': ${error.message}`,
                    error.meta
                );
            } else {
                throw error;
            }
        }

        // Handle generic objects or untyped values
        if (typeof type === 'function' && type === Object.prototype.constructor) {
            return value;
        }

        // Handle enum types
        if (typeof type === 'object' && (type as Function).constructor) {
            return value;
        }

        if (typeof type === 'undefined') {
            return value;
        }

        try {
            // If `type` is a primitive type check if the source value already has the correct type
            if (isPrimitiveTypeEnum(type)) {
                return this.preparePrimitiveProperty(value, type);
            }

            return this.convertValue(value, typeDefinition);
        } catch (error) {
            if (error instanceof SerializationError) {
                throw new SerializationError(
                    `Error while serializing value for key '${key}': ${error.message}`,
                    error.meta
                );
            } else {
                throw error;
            }
        }
    }

    /**
     * If no target key could be detected for sourceKey check if there is a PropertyTypeDefinition
     *
     * @param {T} target
     * @param {string} sourceKey
     * @param {S} source
     */
    private handleSourcePropertyWithoutDefinition<T extends ParDict, S extends ParDict>(
        target: T,
        sourceKey: string,
        source: S
    ): void {
        const logger = this.logger;

        const sourceValue = source[sourceKey];
        const classTypeDefinition = ClassTypeDefinition.fromObject(source);
        if (!classTypeDefinition || classTypeDefinition.ignoreUnknownFields()) {
            if (logger) {
                logger.log(`[Serializer] Property '${sourceKey}' in '${Util.inspectType(source)}' could not be serialized`);
            }

            return;
        }

        if (classTypeDefinition.denyUnknownFields()) {
            throw new SerializationError(`Property '${sourceKey}' in '${Util.inspectType(source)}' could not be found`);
        }

        if (classTypeDefinition.addUnknownFields()) {
            if (logger) {
                logger.debug(`[Serializer] Serialize unknown property '${sourceKey}' of '${Util.inspectType(source)}'`);
            }
            (target as ParDict)[sourceKey] = sourceValue;
        }
    }

    private assertObject(input: any): void {
        if (typeof input !== 'object') {
            throw new SerializationError(`Argument 'input' must be an object, '${typeof input}' given`);
        }
    }

    private preparePrimitiveProperty(
        value: PrimitiveType | any,
        type: PrimitiveTypeEnum
    ): PrimitiveType {
        // E.g. `"string" === "String".toLowerCase()`
        const typeName = typeNameForEnum(type);
        if (typeof value === typeName.toLowerCase()) {
            return value;
        }

        // E.g. `"text".constructor.name === "String"`
        if (value && typeof value === 'object' && (value as object).constructor.name === typeName) {
            return value;
        }

        if (type === PrimitiveTypeEnum.Boolean) {
            return !!(value);
        } else if (type === PrimitiveTypeEnum.Number) {
            return parseFloat('' + value);
        } else if (type === PrimitiveTypeEnum.String) {
            return value !== undefined && value !== null ? '' + value : '';
        } else if (type === PrimitiveTypeEnum.Null) {
            return null;
        } else if (type === PrimitiveTypeEnum.Undefined) {
            return undefined;
        }

        return undefined;
    }
}
