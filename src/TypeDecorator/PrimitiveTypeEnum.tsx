export enum PrimitiveTypeEnum {
    Number = 0x00937120,
    Boolean = 0x00937121,
    String = 0x00937123,
    Null = 0x00937124,
    Undefined = 0x00937125,
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
