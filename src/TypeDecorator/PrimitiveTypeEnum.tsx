export enum PrimitiveTypeEnum {
    Number = 937120,
    Boolean = 937121,
    String = 937123,
    Null = 937124,
    Undefined = 937125,
}

export function typeForTypeName(name: string): PrimitiveTypeEnum | undefined {
    switch (name) {
        case 'Number':
            return PrimitiveTypeEnum.Number;
        case 'Boolean':
            return PrimitiveTypeEnum.Boolean;
        case 'String':
            return PrimitiveTypeEnum.String;
        case 'Null':
            return PrimitiveTypeEnum.Null;
        case 'Undefined':
            return PrimitiveTypeEnum.Undefined;
        default:
            return undefined;
    }
}

export function isPrimitive(value: any): boolean {
    if (typeof value === 'object') {
        return false;
    } else {
        return typeForTypeName(value.constructor.name) !== undefined;
    }
}

export function isNotPrimitive(value: any): value is object {
    return !isPrimitive(value);
}

export function typeNameForEnum(value: PrimitiveTypeEnum): string {
    if (!isPrimitiveTypeEnum(value)) {
        throw new TypeError('Given value is not a PrimitiveTypeEnum');
    }
    switch (value) {
        case PrimitiveTypeEnum.Number:
            return 'Number';
        case PrimitiveTypeEnum.Boolean:
            return 'Boolean';
        case PrimitiveTypeEnum.String:
            return 'String';
        case PrimitiveTypeEnum.Null:
            return 'Null';
        case PrimitiveTypeEnum.Undefined:
            return 'Undefined';
    }
}

export function isPrimitiveTypeEnum(value: PrimitiveTypeEnum | any): value is PrimitiveTypeEnum {
    return value in PrimitiveTypeEnum;
}
