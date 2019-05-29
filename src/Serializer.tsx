import 'reflect-metadata';
import { ParDict } from './Dictionary';
import { SerializationError } from './Error/SerializationError';
import { LoggerInterface } from './LoggerInterface';
import { SerializerInput, SerializerInterface } from './SerializerInterface';
import { ClassTypeDefinition } from './TypeDecorator/ClassLevel';
import { isPrimitiveTypeEnum, PrimitiveTypeEnum, typeNameForEnum } from './TypeDecorator/PrimitiveTypeEnum';
import { PropertyTypeDefinition } from './TypeDecorator/PropertyTypeDefinition';

const replacer = (key: string, value: any) => value === undefined ? null : value;

export interface FormatOptions {
    /**
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_space_argument
     */
    space: string | number | undefined
}

type CollectionType<T> = T[] | Map<string, T> | Map<number, T>;

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
     * @return {object|null}
     */
    private convertValue<T>(
        input: T,
        typeDefinition: PropertyTypeDefinition<T> | undefined
    ): any {
        const target = {};

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
     * @param {I} input
     * @param collectionTypeDefinition
     * @return {T[]}
     */
    private convertArrayCollection<T>(
        input: T[],
        collectionTypeDefinition: PropertyTypeDefinition<T> | undefined
    ): object[] {
        return Array.prototype.map.call(input, (item: T) => this.convertValue(item, collectionTypeDefinition));
    }

    /**
     * Convert a Map of input objects into a single object that can be serialized
     *
     * This method is used to convert a dictionary or Map
     *
     * @param {I} input
     * @param collectionTypeDefinition
     * @return {object}
     */
    private convertMap<T>(
        input: Map<number | string, T>,
        collectionTypeDefinition: PropertyTypeDefinition<T> | undefined
    ): object {
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
     * @param {I} input
     * @param typeDefinition
     * @return {object}
     */
    private convertObjectCollection<T extends ParDict>(
        input: T,
        typeDefinition: PropertyTypeDefinition<T> | undefined
    ): object {
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
    ) {
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

        if (logger) {
            const prepared = this.prepareProperty(
                instance[property],
                property,
                typeDefinition
            );

            logger.debug(
                `[Serializer] Serialize property '${property}' `
                + `of type '${this.inspectType(instance[property])}' `
                + `to type '${this.inspectType(prepared)}'`
            );
        }

        target[targetKey] = this.prepareProperty(
            instance[property],
            property,
            typeDefinition
        );
    }

    private prepareProperty<T>(
        value: T | CollectionType<T>,
        key: string,
        typeDefinition: PropertyTypeDefinition<T>
    ) {
        const type = typeDefinition.type;

        // Handle `null` or `undefined`
        if (value === null || value === undefined) {
            return null;
        }

        // Handle generic objects or untyped values
        if (typeof type === 'function' && type === Object.prototype.constructor) {
            return value;
        }

        if (undefined === type) {
            return value;
        }

        try {
            if (typeDefinition.hasMultiple()) {
                return this.prepareFromCollection(value as CollectionType<T>, typeDefinition);
            }

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
     * @param source
     */
    private handleSourcePropertyWithoutDefinition<T extends ParDict, S extends ParDict>(
        target: T,
        sourceKey: string,
        source: S
    ) {
        const logger = this.logger;

        const sourceValue = source[sourceKey];
        const classTypeDefinition = ClassTypeDefinition.fromObject(source);
        if (!classTypeDefinition || classTypeDefinition.ignoreUnknownFields()) {
            if (logger) {
                logger.log(`[Serializer] Property '${sourceKey}' in '${this.inspectType(source)}' could not be serialized'`);
            }

            return;
        }

        if (classTypeDefinition.denyUnknownFields()) {
            throw new SerializationError(`Property '${sourceKey}' in '${this.inspectType(source)}' could not be found`);
        }

        if (classTypeDefinition.addUnknownFields()) {
            if (logger) {
                logger.debug(`[Serializer] Serialize unknown property '${sourceKey}' of '${this.inspectType(source)}' could not be serialized'`);
            }
            target[sourceKey] = sourceValue;
        }
    }

    private inspectType<S extends ParDict>(input: S) {
        const type = typeof input;

        if (input === null) {
            return '(object) null';
        }
        if (type === 'object') {
            return '(object) ' + input.constructor.name;
        }

        return '(' + type + ')';
    }

    private assertObject(input: any) {
        if (typeof input !== 'object') {
            throw new SerializationError(`Argument 'input' must be an object, '${typeof input}' given`);
        }
    }

    private preparePrimitiveProperty<T>(
        value: T[] | Map<string, T> | Map<number, T> | T,
        type: PrimitiveTypeEnum
    ) {
        // E.g. `"string" === "String".toLowerCase()`
        const typeName = typeNameForEnum(type);
        if (typeof value === typeName.toLowerCase()) {
            return value;
        }

        // E.g. `"text".constructor.name === "String"`
        if (typeof value === 'object' && value.constructor.name === typeName) {
            return value;
        }

        if (type === PrimitiveTypeEnum.Boolean) {
            return !!(value);
        } else if (type === PrimitiveTypeEnum.Number) {
            return parseFloat('' + value);
        } else if (type === PrimitiveTypeEnum.String) {
            return '' + value;
        } else if (type === PrimitiveTypeEnum.Null) {
            return null;
        } else if (type === PrimitiveTypeEnum.Undefined) {
            return undefined;
        }

        return undefined;
    }
}
