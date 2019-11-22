import { ClassConstructorType } from '../ClassConstructorType';
import { metadataKey } from './MetaDataKey';
import { isPrimitiveTypeEnum, PrimitiveTypeEnum } from './PrimitiveTypeEnum';
import { PropertyTypeOptions } from './PropertyLevel';

// eslint-disable-next-line
type TypeOptions<T> = ClassConstructorType<T> | PrimitiveTypeEnum | undefined ;

interface PropertyTypeDefinitionInterface<T> {
    readonly type: TypeOptions<T>;
    readonly options: number;
    readonly propertyKey: string;
    readonly rename: string | undefined;

    hasMultiple(): boolean;

    isLazy(): boolean;
}

export class PropertyTypeDefinition<T> implements PropertyTypeDefinitionInterface<T> {
    public static fromObject<T>(
        instanceOrClass: T | ClassConstructorType<T>,
        key: string
    ): PropertyTypeDefinition<T> | undefined {
        return Reflect.getMetadata(metadataKey, instanceOrClass, key);
    }

    constructor(
        public readonly type: TypeOptions<T>,
        public readonly options: number,
        public readonly propertyKey: string,
        public readonly rename: string | undefined
    ) {
    }

    public hasMultiple(): boolean {
        return (this.options & PropertyTypeOptions.Multiple) > 0;
    }

    public noSerialization(): boolean {
        return (this.options & PropertyTypeOptions.NoSerialization) > 0;
    }

    public isLazy(): boolean {
        return (this.options & PropertyTypeOptions.Lazy) > 0;
    }

    public isPrimitive(): this is PropertyTypeDefinition<PrimitiveTypeEnum> {
        return isPrimitiveTypeEnum(this.type);
    }
}

export {
    metadataKey
};
