import 'reflect-metadata';
import { ClassConstructorType } from '../ClassConstructorType';
import { metadataKey } from './MetaDataKey';

export class ClassTypeDefinition<T> {
    public static fromObject<T>(instanceOrClass: T | ClassConstructorType<T>): ClassTypeDefinition<T> | undefined {
        if (typeof instanceOrClass === 'function' && typeof instanceOrClass.prototype !== 'undefined') {
            return Reflect.getMetadata(metadataKey, instanceOrClass.prototype);
        }

        return Reflect.getMetadata(metadataKey, instanceOrClass);
    }

    constructor(public readonly options: number) {
        if (options & ClassTypeOptions.AddUnknownFields && options & ClassTypeOptions.DenyUnknownFields) {
            throw new TypeError('AddUnknownFields and DenyUnknownFields must not be used together');
        }
    }

    public denyUnknownFields(): boolean {
        return (this.options & ClassTypeOptions.DenyUnknownFields) > 0;
    }

    public addUnknownFields(): boolean {
        return (this.options & ClassTypeOptions.AddUnknownFields) > 0;
    }

    public ignoreUnknownFields(): boolean {
        return this.options === ClassTypeOptions.None || (!this.denyUnknownFields() && !this.addUnknownFields());
    }
}

export enum ClassTypeOptions {
    None = 0b00000,
    DenyUnknownFields = 0b00001,
    AddUnknownFields = 0b00010,
}

export function ra<T>(options: ClassTypeOptions = ClassTypeOptions.None) {
    return (target: ClassConstructorType<T>): void => {
        Reflect.defineMetadata(metadataKey, new ClassTypeDefinition(options), target.prototype);
    };
}
