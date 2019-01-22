import 'reflect-metadata';
import { SerializerInput, SerializerInterface } from './SerializerInterface';
import { ClassTypeDefinition } from './TypeDecorator/ClassLevel';
import { isPrimitiveTypeEnum, PrimitiveTypeEnum, typeNameForEnum } from './TypeDecorator/PrimitiveTypeEnum';
import { PropertyTypeDefinition } from './TypeDecorator/PropertyTypeDefinition';

export interface LoggerInterface {
    log: (message: string, ...args: any[]) => void;
}

export class Serializer<B extends object> implements SerializerInterface<B> {
    constructor(private logger?: LoggerInterface) {
    }

    public serialize<T extends object = B>(input: SerializerInput<T> | null): string {
        if (Array.isArray(input) || input instanceof Map) {
            return JSON.stringify(this.prepareFromCollection(input));
        } else if (input !== null) {
            return JSON.stringify(this.convertSingleInput(input));
        } else {
            return JSON.stringify(null);
        }
    }

    /**
     * Convert a collection of input objects into a single object that can be serialized
     *
     * @param {T[] | Map<string, T> | Map<number, T>} input
     * @return {object}
     */
    private prepareFromCollection<T extends object = B>(input: T[] | Map<string, T> | Map<number, T>): object {
        if (Array.isArray(input)) {
            return this.convertArrayCollection(input);
        } else if (input instanceof Map) {
            return this.convertMap(input);
        } else {
            return this.convertObjectCollection(input);
        }
    }

    /**
     * Convert a single object into an object that can be serialized
     *
     * @param {T} input
     * @return {object}
     */
    private convertSingleInput<T extends object = B>(input: T): object {
        const target = {};
        if (input instanceof Date) {
            return input;
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
     * @return {T[]}
     */
    private convertArrayCollection<I, T>(input: I): object[] {
        return Array.prototype.map.call(input, (item: object) => this.convertSingleInput(item));
    }

    /**
     * Convert a Map of input objects into a single object that can be serialized
     *
     * This method is used to convert a dictionary or Map
     *
     * @param {I} input
     * @return {object}
     */
    private convertMap<T extends object>(input: Map<number | string, T>): object {
        const targetObject = {};

        input.forEach(
            (value, key) => {
                targetObject[key] = this.convertSingleInput(value);
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
     * @return {object}
     */
    private convertObjectCollection<T>(input: T): object {
        const targetObject = {};

        Object.keys(input).forEach(
            key => {
                targetObject[key] = this.convertSingleInput(input[key]);
            }
        );

        return targetObject;
    }

    private serializeProperty<T>(target: object, property: string, instance: T) {
        const typeDefinition = PropertyTypeDefinition.fromObject<T>(instance, property);
        if (!typeDefinition) {
            this.handleSourcePropertyWithoutDefinition(target, property, instance);

            return;
        }
        // Look if there is a Property Type Definition for the property
        const targetKey = typeDefinition.rename
            ? typeDefinition.rename
            : property;

        target[targetKey] = this.prepareSourceValue(
            instance,
            property,
            typeDefinition
        );
    }

    private prepareSourceValue<T>(
        source: T,
        sourceKey: string,
        typeDefinition: PropertyTypeDefinition<T>
    ) {
        const sourceValue = source[sourceKey];

        const type = typeDefinition.type;

        // If `type` is a primitive type check if the source value already has the correct type
        if (isPrimitiveTypeEnum(type)) {
            if (typeof sourceValue === typeNameForEnum(type).toLowerCase()) {
                return sourceValue;
            } else if (typeof sourceValue === 'object' && sourceValue.constructor.name === typeNameForEnum(type)) {
                return sourceValue;
            }

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
            }
        }

        if (undefined === type) {
            return sourceValue;
        } else if (typeDefinition.hasMultiple()) {
            return this.prepareFromCollection(sourceValue);
        } else {
            return this.convertSingleInput(sourceValue);
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
        const classTypeDefinition = ClassTypeDefinition.fromObject(source);
        if (!classTypeDefinition || classTypeDefinition.ignoreUnknownFields()) {
            if (this.logger) {
                this.logger.log(`Property '${sourceKey}' in '${source.constructor.name}' could not be serialized'`);
            }

            return;
        }

        if (classTypeDefinition.denyUnknownFields()) {
            throw new TypeError(`Property '${sourceKey}' in '${source.constructor.name}' could not be found`);
        }

        if (classTypeDefinition.addUnknownFields()) {
            target[sourceKey] = sourceValue;
        }
    }
}
