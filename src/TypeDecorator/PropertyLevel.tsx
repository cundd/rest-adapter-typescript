/* tslint:disable:unified-signatures */
import 'reflect-metadata';
import { ClassConstructorType } from '../ClassConstructorType';

const metadataKey = 'design:type';

export class PropertyTypeDefinition<T> {
    public static fromObject<T>(
        instanceOrClass: T | ClassConstructorType<T>,
        key: string
    ): PropertyTypeDefinition<T> | undefined {
        return Reflect.getMetadata(metadataKey, instanceOrClass, key);
    }

    constructor(
        readonly type: ClassConstructorType<T> | undefined,
        readonly options: number,
        readonly propertyKey: string,
        readonly rename: string | undefined
    ) {
    }

    public hasMultiple(): boolean {
        return (this.options & PropertyTypeOptions.Multiple) > 0;
    }

    public isLazy(): boolean {
        return (this.options & PropertyTypeOptions.Lazy) > 0;
    }
}

// type RaPropertyAttributes<T> = ClassConstructorType<T> | string | number | undefined;
type RaPropertyReturn = <P extends object>(target: P, propertyKey: string) => void;

/**
 * Example:
 *
 *  ```
 *      export class Model {
 *          @ra_property(Address, PropertyTypeOptions.Lazy, 'address')
 *          _address: Address
 *      }
 *  ```
 * @param {ClassConstructorType<T>} type Convert the input value into an instance of this Constructor
 * @param {PropertyTypeOptions} options
 * @param {string} rename Use this key instead of the property key when converting
 * @return {RaPropertyReturn}
 */
export function ra_property<T>(
    type: ClassConstructorType<T>,
    options: PropertyTypeOptions,
    rename: string
): RaPropertyReturn;

/**
 * Example:
 *
 *  ```
 *      export class Model {
 *          @ra_property(Address, PropertyTypeOptions.Lazy)
 *          _address: Address
 *      }
 *  ```
 * @param {ClassConstructorType<T>} type Convert the input value into an instance of this Constructor
 * @param {PropertyTypeOptions} options
 * @return {RaPropertyReturn}
 */
export function ra_property<T>(
    type: ClassConstructorType<T>,
    options: PropertyTypeOptions
): RaPropertyReturn;

/**
 * Example:
 *
 *  ```
 *      export class Model {
 *          @ra_property(Address, 'address')
 *          _address: Address
 *      }
 *  ```
 * @param {ClassConstructorType<T>} type Convert the input value into an instance of this Constructor
 * @param {string} rename Use this key instead of the property key when converting
 * @return {RaPropertyReturn}
 */
export function ra_property<T>(
    type: ClassConstructorType<T>,
    rename: string
): RaPropertyReturn;

/**
 * Example:
 *
 *  ```
 *      export class Model {
 *          @ra_property('street', PropertyTypeOptions.Lazy)
 *          _street: string
 *      }
 *  ```
 * @param {string} rename Use this key instead of the property key when converting
 * @param {PropertyTypeOptions} options
 * @return {RaPropertyReturn}
 */
export function ra_property<T>(
    rename: string,
    options: PropertyTypeOptions
): RaPropertyReturn;

/**
 * Example:
 *
 *  ```
 *      export class Model {
 *          @ra_property('street')
 *          _street: string
 *      }
 *  ```
 * @param {string} rename Use this key instead of the property key when converting
 * @return {RaPropertyReturn}
 */
export function ra_property<T>(
    rename: string
): RaPropertyReturn;

/**
 * Example:
 *
 *  ```
 *      export class Model {
 *          @ra_property(Address)
 *          address: Address
 *      }
 *  ```
 * @param {ClassConstructorType<T>} type Convert the input value into an instance of this Constructor
 * @return {RaPropertyReturn}
 */
export function ra_property<T>(
    type: ClassConstructorType<T>
): RaPropertyReturn;

/**
 * Example:
 *
 *  ```
 *      export class Model {
 *          @ra_property()
 *      }
 *  ```
 * @return {RaPropertyReturn}
 */
export function ra_property(): RaPropertyReturn;

export function ra_property<T>(...args: any[]) {
    return <P extends object>(target: P, propertyKey: string) => {
        let type: ClassConstructorType<T> | undefined;
        let rename: string | undefined;
        let options: number = PropertyTypeOptions.None;
        for (const arg of args) {
            if (typeof arg === 'string') {
                rename = arg;
            } else if (typeof arg === 'function') {
                type = arg;
            } else if (typeof  arg === 'number') {
                options = arg;
            }
        }

        const propertyTypeDefinition = new PropertyTypeDefinition(type, options, propertyKey, rename);
        Reflect.defineMetadata(
            metadataKey,
            propertyTypeDefinition,
            target,
            propertyKey
        );

        // If `rename` is given, also register the metadata for it
        if (rename) {
            Reflect.defineMetadata(
                metadataKey,
                propertyTypeDefinition,
                target,
                rename
            );
        }
    };
}

export enum PropertyTypeOptions {
    None = 0b00000,
    Multiple = 0b00001,
    Lazy = 0b00010, // Not implemented yet
}
