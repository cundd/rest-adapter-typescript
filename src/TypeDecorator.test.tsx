import { ClassConstructorType } from './ClassConstructorType';
import { Address } from './Tests/Fixtures/Address';
import { AddressBook } from './Tests/Fixtures/AddressBook';
import { Order } from './Tests/Fixtures/Order';
import { Person } from './Tests/Fixtures/Person';
import { Type, TypeDefinition, TypeOptions } from './TypeDecorator';

class MixedOptions {
    @Type(Person, TypeOptions.None)
    none: Person;

    @Type(Person, TypeOptions.Lazy)
    lazy: Person;

    @Type(Person, TypeOptions.Multiple)
    multiple: Person;

    @Type(Person, TypeOptions.Multiple | TypeOptions.Lazy)
    multipleLazy: Person;
}

// ================================================================================================
// Different tests

// tslint:disable-next-line:no-any
type TypeDefinitionProvider<T> = (instanceOrClass: object | ClassConstructorType<any>) => TypeDefinition<T>;

// tslint:disable:no-any
type TypeDefinitionProviderMixedOptions = (
    instanceOrClass: object | ClassConstructorType<any>,
    key: string
) => TypeDefinition<MixedOptions>;
// tslint:enable:no-any

const addressTest = (instanceOrClass: object, provider: TypeDefinitionProvider<Person>) => {
    const metadata: TypeDefinition<Person> = provider(instanceOrClass);
    expect(metadata).toBeDefined();
    expect(metadata).toBeInstanceOf(TypeDefinition);
    expect(metadata.type).toEqual(Person);
    expect(metadata.options).toEqual(TypeOptions.None);
    expect(metadata.hasMultiple()).toBeFalsy();
};
const addressBookTest = (instanceOrClass: object, provider: TypeDefinitionProvider<Address>) => {
    const metadata: TypeDefinition<Address> = provider(instanceOrClass);
    expect(metadata).toBeDefined();
    expect(metadata).toBeInstanceOf(TypeDefinition);
    expect(metadata.type).toEqual(Address);
    expect(metadata.options).toEqual(TypeOptions.Multiple);
    expect(metadata.hasMultiple()).toBeTruthy();
};
const orderTest = (instanceOrClass: object, provider: TypeDefinitionProvider<Order>) => {
    const metadata: TypeDefinition<Order> = provider(instanceOrClass);
    expect(metadata).toBeDefined();
    expect(metadata).toBeInstanceOf(TypeDefinition);
    expect(metadata.type).toEqual(Address);
    expect(metadata.options).toEqual(TypeOptions.Lazy);
    expect(metadata.hasMultiple()).toBeFalsy();
};

const mixedOptionsTest = (instanceOrClass: object, provider: TypeDefinitionProviderMixedOptions) => {
    {
        const metadata: TypeDefinition<MixedOptions> = provider(instanceOrClass, 'none');
        expect(metadata).toBeDefined();
        expect(metadata).toBeInstanceOf(TypeDefinition);
        expect(metadata.type).toEqual(Person);
        expect(metadata.options).toEqual(TypeOptions.None);
        expect(metadata.hasMultiple()).toBeFalsy();
        expect(metadata.isLazy()).toBeFalsy();
    }
    {
        const metadata: TypeDefinition<MixedOptions> = provider(instanceOrClass, 'lazy');
        expect(metadata).toBeDefined();
        expect(metadata).toBeInstanceOf(TypeDefinition);
        expect(metadata.type).toEqual(Person);
        expect(metadata.options).toEqual(TypeOptions.Lazy);
        expect(metadata.hasMultiple()).toBeFalsy();
        expect(metadata.isLazy()).toBeTruthy();
    }
    {
        const metadata: TypeDefinition<MixedOptions> = provider(instanceOrClass, 'multiple');
        expect(metadata).toBeDefined();
        expect(metadata).toBeInstanceOf(TypeDefinition);
        expect(metadata.type).toEqual(Person);
        expect(metadata.options).toEqual(TypeOptions.Multiple);
        expect(metadata.hasMultiple()).toBeTruthy();
        expect(metadata.isLazy()).toBeFalsy();
    }
    {
        const metadata: TypeDefinition<MixedOptions> = provider(instanceOrClass, 'multipleLazy');
        expect(metadata).toBeDefined();
        expect(metadata).toBeInstanceOf(TypeDefinition);
        expect(metadata.type).toEqual(Person);
        expect(metadata.options & TypeOptions.Multiple).toBeTruthy();
        expect(metadata.options & TypeOptions.Lazy).toBeTruthy();
        expect(metadata.hasMultiple()).toBeTruthy();
        expect(metadata.isLazy()).toBeTruthy();
    }
};

// ================================================================================================

describe('Must have type information', () => {
    describe('Address', () => {
        it('instance', () => {
            addressTest(
                new Address(),
                instanceOrClass => Reflect.getMetadata('design:type', instanceOrClass, '_person')
            );
        });
        it('prototype', () => {
            addressTest(
                Address.prototype,
                instanceOrClass => Reflect.getMetadata('design:type', instanceOrClass, '_person')
            );
        });
    });
    describe('Address Book', () => {
        it('instance', () => {
            addressBookTest(
                new AddressBook(),
                instanceOrClass => Reflect.getMetadata('design:type', instanceOrClass, 'contacts')
            );
        });
        it('prototype', () => {
            addressBookTest(
                AddressBook.prototype,
                instanceOrClass => Reflect.getMetadata('design:type', instanceOrClass, 'contacts')
            );
        });
    });
    describe('Order', () => {
        it('instance', () => {
            orderTest(
                new Order(),
                instanceOrClass => Reflect.getMetadata('design:type', instanceOrClass, 'address')
            );
        });
        it('prototype', () => {
            orderTest(
                Order.prototype,
                instanceOrClass => Reflect.getMetadata('design:type', instanceOrClass, 'address')
            );
        });
    });
    describe('Mixed Options', () => {
        it('instance', () => {
            mixedOptionsTest(
                new MixedOptions(),
                (instanceOrClass, key) => Reflect.getMetadata('design:type', instanceOrClass, key)
            );
        });
        it('prototype', () => {
            mixedOptionsTest(
                MixedOptions.prototype,
                (instanceOrClass, key) => Reflect.getMetadata('design:type', instanceOrClass, key)
            );
        });
    });
});

describe('Fetch type information', () => {
    describe('Address', () => {
        it('instance', () => {
            addressTest(
                new Address(),
                instanceOrClass => TypeDefinition.fromObject(instanceOrClass, '_person')
            );
        });
        it('prototype', () => {
            addressTest(
                Address.prototype,
                instanceOrClass => TypeDefinition.fromObject(instanceOrClass, '_person')
            );
        });
    });
    describe('Address Book', () => {
        it('instance', () => {
            addressBookTest(
                new AddressBook(),
                instanceOrClass => TypeDefinition.fromObject(instanceOrClass, 'contacts')
            );
        });
        it('prototype', () => {
            addressBookTest(
                AddressBook.prototype,
                instanceOrClass => TypeDefinition.fromObject(instanceOrClass, 'contacts')
            );
        });
    });
    describe('Order', () => {
        it('instance', () => {
            orderTest(
                new Order(),
                instanceOrClass => TypeDefinition.fromObject(instanceOrClass, 'address')
            );
        });
        it('prototype', () => {
            orderTest(
                Order.prototype,
                instanceOrClass => TypeDefinition.fromObject(instanceOrClass, 'address')
            );
        });
    });
    describe('Mixed Options', () => {
        it('instance', () => {
            mixedOptionsTest(
                new MixedOptions(),
                (instanceOrClass, key) => TypeDefinition.fromObject(instanceOrClass, key)
            );
        });
        it('prototype', () => {
            mixedOptionsTest(
                MixedOptions.prototype,
                (instanceOrClass, key) => TypeDefinition.fromObject(instanceOrClass, key)
            );
        });
    });
});
