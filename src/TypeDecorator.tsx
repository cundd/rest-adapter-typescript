import 'reflect-metadata';
import { ClassConstructorType } from './ClassConstructorType';

export class TypeDefinition<T> {
    public static fromObject<T>(
        instanceOrClass: object | ClassConstructorType<T>,
        key: string
    ): TypeDefinition<T> {
        return Reflect.getMetadata('design:type', instanceOrClass, key);
    }

    constructor(readonly type: ClassConstructorType<T>, readonly options: number) {
    }

    public hasMultiple(): boolean {
        return (this.options & TypeOptions.Multiple) > 0;
    }

    public isLazy(): boolean {
        return (this.options & TypeOptions.Lazy) > 0;
    }
}

export function Type<T>(type: ClassConstructorType<T>, options: TypeOptions = TypeOptions.None) {
    return Reflect.metadata('design:type', new TypeDefinition(type, options));
}

export enum TypeOptions {
    None = 0b00000,
    Multiple = 0b00001,
    Lazy = 0b00010, // Not implemented yet
}
