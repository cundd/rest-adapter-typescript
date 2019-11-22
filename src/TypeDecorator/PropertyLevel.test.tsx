import { ClassConstructorType } from '../ClassConstructorType';
import { Address } from '../Tests/Fixtures/Address';
import { AddressBook } from '../Tests/Fixtures/AddressBook';
import { Order } from '../Tests/Fixtures/Order';
import { Person } from '../Tests/Fixtures/Person';
import { PropertyTypeOptions, ra_property } from './PropertyLevel';
import { metadataKey, PropertyTypeDefinition } from './PropertyTypeDefinition';

class MixedOptions {
    @ra_property(Person, PropertyTypeOptions.None)
    public none: Person;

    @ra_property(Person, PropertyTypeOptions.Lazy)
    public lazy: Person;

    @ra_property(Person, PropertyTypeOptions.Multiple)
    public multiple: Person;

    @ra_property(Person, PropertyTypeOptions.Multiple | PropertyTypeOptions.Lazy)
    public multipleLazy: Person;
}

// ================================================================================================
// Different tests

type PropertyTypeDefinitionProvider<T> = (i: object | ClassConstructorType<any>) => PropertyTypeDefinition<T> | undefined;

type PropertyTypeDefinitionProviderMixedOptions = (
    instanceOrClass: object | ClassConstructorType<any>,
    key: string
) => PropertyTypeDefinition<MixedOptions> | undefined;

const addressTest = (instanceOrClass: object, provider: PropertyTypeDefinitionProvider<Person>): void => {
    const metadata = provider(instanceOrClass) as PropertyTypeDefinition<Person>;
    expect(metadata).toBeDefined();
    expect(metadata).toBeInstanceOf(PropertyTypeDefinition);
    expect(metadata.type).toEqual(Person);
    expect(metadata.options).toEqual(PropertyTypeOptions.None);
    expect(metadata.hasMultiple()).toBeFalsy();
};
const addressBookTest = (instanceOrClass: object, provider: PropertyTypeDefinitionProvider<Address>): void => {
    const metadata = provider(instanceOrClass) as PropertyTypeDefinition<Address>;
    expect(metadata).toBeDefined();
    expect(metadata).toBeInstanceOf(PropertyTypeDefinition);
    expect(metadata.type).toEqual(Address);
    expect(metadata.options).toEqual(PropertyTypeOptions.Multiple);
    expect(metadata.hasMultiple()).toBeTruthy();
};
const orderTest = (instanceOrClass: object, provider: PropertyTypeDefinitionProvider<Order>): void => {
    const metadata = provider(instanceOrClass) as PropertyTypeDefinition<Order>;
    expect(metadata).toBeDefined();
    expect(metadata).toBeInstanceOf(PropertyTypeDefinition);
    expect(metadata.type).toEqual(Address);
    expect(metadata.options).toEqual(PropertyTypeOptions.Lazy);
    expect(metadata.hasMultiple()).toBeFalsy();
};

const mixedOptionsTest = (instanceOrClass: object, provider: PropertyTypeDefinitionProviderMixedOptions): void => {
    {
        const metadata = provider(instanceOrClass, 'none') as PropertyTypeDefinition<MixedOptions>;
        expect(metadata).toBeDefined();
        expect(metadata).toBeInstanceOf(PropertyTypeDefinition);
        expect(metadata.type).toEqual(Person);
        expect(metadata.options).toEqual(PropertyTypeOptions.None);
        expect(metadata.hasMultiple()).toBeFalsy();
        expect(metadata.isLazy()).toBeFalsy();
    }
    {
        const metadata = provider(instanceOrClass, 'lazy') as PropertyTypeDefinition<MixedOptions>;
        expect(metadata).toBeDefined();
        expect(metadata).toBeInstanceOf(PropertyTypeDefinition);
        expect(metadata.type).toEqual(Person);
        expect(metadata.options).toEqual(PropertyTypeOptions.Lazy);
        expect(metadata.hasMultiple()).toBeFalsy();
        expect(metadata.isLazy()).toBeTruthy();
    }
    {
        const metadata = provider(instanceOrClass, 'multiple') as PropertyTypeDefinition<MixedOptions>;
        expect(metadata).toBeDefined();
        expect(metadata).toBeInstanceOf(PropertyTypeDefinition);
        expect(metadata.type).toEqual(Person);
        expect(metadata.options).toEqual(PropertyTypeOptions.Multiple);
        expect(metadata.hasMultiple()).toBeTruthy();
        expect(metadata.isLazy()).toBeFalsy();
    }
    {
        const metadata = provider(instanceOrClass, 'multipleLazy') as PropertyTypeDefinition<MixedOptions>;
        expect(metadata).toBeDefined();
        expect(metadata).toBeInstanceOf(PropertyTypeDefinition);
        expect(metadata.type).toEqual(Person);
        expect(metadata.options & PropertyTypeOptions.Multiple).toBeTruthy();
        expect(metadata.options & PropertyTypeOptions.Lazy).toBeTruthy();
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
                instanceOrClass => Reflect.getMetadata(metadataKey, instanceOrClass, '_person')
            );
        });
        it('prototype', () => {
            addressTest(
                Address.prototype,
                instanceOrClass => Reflect.getMetadata(metadataKey, instanceOrClass, '_person')
            );
        });
    });
    describe('Address Book', () => {
        it('instance', () => {
            addressBookTest(
                new AddressBook(),
                instanceOrClass => Reflect.getMetadata(metadataKey, instanceOrClass, 'contacts')
            );
        });
        it('prototype', () => {
            addressBookTest(
                AddressBook.prototype,
                instanceOrClass => Reflect.getMetadata(metadataKey, instanceOrClass, 'contacts')
            );
        });
    });
    describe('Order', () => {
        it('instance', () => {
            orderTest(
                new Order(),
                instanceOrClass => Reflect.getMetadata(metadataKey, instanceOrClass, 'address')
            );
        });
        it('prototype', () => {
            orderTest(
                Order.prototype,
                instanceOrClass => Reflect.getMetadata(metadataKey, instanceOrClass, 'address')
            );
        });
    });
    describe('Mixed Options', () => {
        it('instance', () => {
            mixedOptionsTest(
                new MixedOptions(),
                (instanceOrClass, key) => Reflect.getMetadata(metadataKey, instanceOrClass, key)
            );
        });
        it('prototype', () => {
            mixedOptionsTest(
                MixedOptions.prototype,
                (instanceOrClass, key) => Reflect.getMetadata(metadataKey, instanceOrClass, key)
            );
        });
    });
});

describe('Fetch type information', () => {
    describe('Address', () => {
        it('instance', () => {
            addressTest(
                new Address(),
                instanceOrClass => PropertyTypeDefinition.fromObject(instanceOrClass, '_person')
            );
        });
        it('prototype', () => {
            addressTest(
                Address.prototype,
                instanceOrClass => PropertyTypeDefinition.fromObject(instanceOrClass, '_person')
            );
        });
    });
    describe('Address Book', () => {
        it('instance', () => {
            addressBookTest(
                new AddressBook(),
                instanceOrClass => PropertyTypeDefinition.fromObject(instanceOrClass, 'contacts')
            );
        });
        it('prototype', () => {
            addressBookTest(
                AddressBook.prototype,
                instanceOrClass => PropertyTypeDefinition.fromObject(instanceOrClass, 'contacts')
            );
        });
    });
    describe('Order', () => {
        it('instance', () => {
            orderTest(
                new Order(),
                instanceOrClass => PropertyTypeDefinition.fromObject(instanceOrClass, 'address')
            );
        });
        it('prototype', () => {
            orderTest(
                Order.prototype,
                instanceOrClass => PropertyTypeDefinition.fromObject(instanceOrClass, 'address')
            );
        });
    });
    describe('Mixed Options', () => {
        it('instance', () => {
            mixedOptionsTest(
                new MixedOptions(),
                (instanceOrClass, key) => PropertyTypeDefinition.fromObject(instanceOrClass, key)
            );
        });
        it('prototype', () => {
            mixedOptionsTest(
                MixedOptions.prototype,
                (instanceOrClass, key) => PropertyTypeDefinition.fromObject(instanceOrClass, key)
            );
        });
    });
});
