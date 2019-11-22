import { ClassConstructorType } from '../ClassConstructorType';
import { Address } from '../Tests/Fixtures/Address';
import { AddUnknownFields } from '../Tests/Fixtures/AddUnknownFields';
import { DenyUnknownFields } from '../Tests/Fixtures/DenyUnknownFields';
import { ClassTypeDefinition, ClassTypeOptions, ra } from './ClassLevel';
import { metadataKey } from './MetaDataKey';

// ================================================================================================
// Different tests
type ClassTypeDefinitionProvider<T> = (i: object | ClassConstructorType<any>) => ClassTypeDefinition<T> | undefined;

const denyUnknownFieldsTest = (
    instanceOrClass: object,
    provider: ClassTypeDefinitionProvider<DenyUnknownFields>
): void => {
    const metadata = provider(instanceOrClass) as ClassTypeDefinition<DenyUnknownFields>;
    expect(metadata).toBeDefined();
    expect(metadata).toBeInstanceOf(ClassTypeDefinition);
    expect(metadata.options).toEqual(ClassTypeOptions.DenyUnknownFields);
    expect(metadata.ignoreUnknownFields()).toBeFalsy();
    expect(metadata.denyUnknownFields()).toBeTruthy();
    expect(metadata.addUnknownFields()).toBeFalsy();
};
const addUnknownFieldsTest = (
    instanceOrClass: object,
    provider: ClassTypeDefinitionProvider<AddUnknownFields>
): void => {
    const metadata = provider(instanceOrClass) as ClassTypeDefinition<AddUnknownFields>;
    expect(metadata).toBeDefined();
    expect(metadata).toBeInstanceOf(ClassTypeDefinition);
    expect(metadata.options).toEqual(ClassTypeOptions.AddUnknownFields);
    expect(metadata.ignoreUnknownFields()).toBeFalsy();
    expect(metadata.denyUnknownFields()).toBeFalsy();
    expect(metadata.addUnknownFields()).toBeTruthy();
};
const addressTest = (instanceOrClass: object, provider: ClassTypeDefinitionProvider<Address>): void => {
    const metadata = provider(instanceOrClass) as ClassTypeDefinition<Address>;
    expect(metadata).toBeDefined();
    expect(metadata).toBeInstanceOf(ClassTypeDefinition);
    expect(metadata.options).toEqual(ClassTypeOptions.None);
    expect(metadata.ignoreUnknownFields()).toBeTruthy();
    expect(metadata.denyUnknownFields()).toBeFalsy();
    expect(metadata.addUnknownFields()).toBeFalsy();
};

// ================================================================================================

describe('Must have type information', () => {
    describe('AddUnknownFields', () => {
        it('instance', () => {
            addUnknownFieldsTest(
                new AddUnknownFields(),
                instanceOrClass => Reflect.getMetadata(metadataKey, instanceOrClass)
            );
        });
        it('prototype', () => {
            addUnknownFieldsTest(
                AddUnknownFields.prototype,
                instanceOrClass => Reflect.getMetadata(metadataKey, instanceOrClass)
            );
        });
    });
    describe('DenyUnknownFields', () => {
        it('instance', () => {
            denyUnknownFieldsTest(
                new DenyUnknownFields(),
                instanceOrClass => Reflect.getMetadata(metadataKey, instanceOrClass)
            );
        });
        it('prototype', () => {
            denyUnknownFieldsTest(
                DenyUnknownFields.prototype,
                instanceOrClass => Reflect.getMetadata(metadataKey, instanceOrClass)
            );
        });
    });
    describe('Address', () => {
        it('instance', () => {
            addressTest(
                new Address(),
                instanceOrClass => Reflect.getMetadata(metadataKey, instanceOrClass)
            );
        });
        it('prototype', () => {
            addressTest(
                Address.prototype,
                instanceOrClass => Reflect.getMetadata(metadataKey, instanceOrClass)
            );
        });
    });
});

describe('Fetch type information', () => {
    describe('AddUnknownFields', () => {
        it('instance', () => {
            addUnknownFieldsTest(
                new AddUnknownFields(),
                instanceOrClass => Reflect.getMetadata(metadataKey, instanceOrClass)
            );
        });
        it('prototype', () => {
            addUnknownFieldsTest(
                AddUnknownFields.prototype,
                instanceOrClass => ClassTypeDefinition.fromObject(instanceOrClass)
            );
        });
        it('class', () => {
            addUnknownFieldsTest(
                AddUnknownFields,
                instanceOrClass => ClassTypeDefinition.fromObject(instanceOrClass)
            );
        });
    });
    describe('DenyUnknownFields', () => {
        it('instance', () => {
            denyUnknownFieldsTest(
                new DenyUnknownFields(),
                instanceOrClass => ClassTypeDefinition.fromObject(instanceOrClass)
            );
        });
        it('prototype', () => {
            denyUnknownFieldsTest(
                DenyUnknownFields.prototype,
                instanceOrClass => ClassTypeDefinition.fromObject(instanceOrClass)
            );
        });
        it('class', () => {
            denyUnknownFieldsTest(
                DenyUnknownFields,
                instanceOrClass => ClassTypeDefinition.fromObject(instanceOrClass)
            );
        });
    });
    describe('Address', () => {
        it('instance', () => {
            denyUnknownFieldsTest(
                new DenyUnknownFields(),
                instanceOrClass => ClassTypeDefinition.fromObject(instanceOrClass)
            );
        });
        it('prototype', () => {
            denyUnknownFieldsTest(
                DenyUnknownFields.prototype,
                instanceOrClass => ClassTypeDefinition.fromObject(instanceOrClass)
            );
        });
        it('class', () => {
            denyUnknownFieldsTest(
                DenyUnknownFields,
                instanceOrClass => ClassTypeDefinition.fromObject(instanceOrClass)
            );
        });
    });
});

describe('Validation', () => {
    it('Must not use DenyUnknownFields and AddUnknownFields together', () => {
        expect(() => {
            @ra(ClassTypeOptions.AddUnknownFields | ClassTypeOptions.DenyUnknownFields)
                // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            class AddAndDenyUnknownFields {
            }
        }).toThrowError('AddUnknownFields and DenyUnknownFields must not be used together');
    });
});
