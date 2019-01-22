/* tslint:disable:no-any */

import { Serializer } from './Serializer';
import { Accessors } from './Tests/Fixtures/Accessors';
import { Address } from './Tests/Fixtures/Address';
import { AddressBook } from './Tests/Fixtures/AddressBook';
import { BankAccount } from './Tests/Fixtures/BankAccount';
import { CalendarEvent } from './Tests/Fixtures/CalendarEvent';
import { Person } from './Tests/Fixtures/Person';

function buildAddress(name: string, age: number | string, street: string) {
    const address = new Address();
    const person = new Person();
    person.name = name;
    person.age = age as number;
    address.internalSetPerson(person);
    address.internalSetStreet(street);

    return address;
}

describe('serialize', () => {
    it('with class Person', () => {
        const person = new Person();
        person.name = 'Daniel';
        person.age = 31;

        const serializer = new Serializer();
        const result = serializer.serialize(person);
        expect(result).toBe('{"name":"Daniel","age":31}');
    });

    it('with primitive Classes', () => {
        const person = new Person();

        // tslint:disable:no-construct
        // noinspection JSPrimitiveTypeWrapperUsage,UnnecessaryLocalVariableJS
        const stringObject = new String('Daniel');
        // @ts-ignore
        person.name = stringObject;

        // noinspection JSPrimitiveTypeWrapperUsage,UnnecessaryLocalVariableJS
        const numberObject = new Number(31);
        // @ts-ignore
        person.age = numberObject;

        const serializer = new Serializer();
        const result = serializer.serialize(person);
        expect(result).toBe('{"name":"Daniel","age":31}');
    });

    it('with class Accessors', () => {
        const serializer = new Serializer();
        const person = new Accessors();
        person.internalSetName('Daniel');
        person.internalSetAge(31);
        const result = serializer.serialize(person);
        expect(result).toBe('{"name":"Daniel","age":31}');
    });

    it('with class Person and primitives', () => {
        const serializer = new Serializer();
        const person = new Accessors();
        person.internalSetName('Daniel');
        person.internalSetAge('32'); // <= must be transformed into a number
        const result = serializer.serialize(person);
        expect(result).toBe('{"name":"Daniel","age":32}');
    });

    it('with class Address', () => {
        const serializer = new Serializer<Address>();
        const address = buildAddress('Daniel', 31, 'Mainstreet 123');
        const result = serializer.serialize(address);
        expect(result).toBe('{"person":{"name":"Daniel","age":31},"street":"Mainstreet 123"}');
    });

    it('with class AddressBook (contacts array-collection)', () => {
        const serializer = new Serializer<AddressBook>();
        const addressBook = new AddressBook();
        addressBook.contacts = new Map(
            [
                ['1', buildAddress('Daniel', 31, 'Mainstreet 123')],
                ['2', buildAddress('Peter', '29', 'Otherstreet 321')],
            ]
        );
        const result = serializer.serialize(addressBook);

        expect(result).toBe(
            '{"contacts":{"1":{"person":{"name":"Daniel","age":31},"street":"Mainstreet 123"},"2":{"person":{"name":"Peter","age":29},"street":"Otherstreet 321"}}}'
        );

    });

    it('with class AddressBook (contacts object-collection)', () => {
        const serializer = new Serializer<AddressBook>();
        const addressBook = new AddressBook();
        addressBook.contacts = new Map(
            [
                ['daniel', buildAddress('Daniel', 31, 'Mainstreet 123')],
                ['peter', buildAddress('Peter', '29', 'Otherstreet 321')],
            ]
        );
        const result = serializer.serialize(addressBook);

        expect(result).toBe(
            '{"contacts":{"daniel":{"person":{"name":"Daniel","age":31},"street":"Mainstreet 123"},"peter":{"person":{"name":"Peter","age":29},"street":"Otherstreet 321"}}}'
        );
    });

    it('with class BankAccount', () => {
        const serializer = new Serializer<BankAccount>();
        const bankAccount = new BankAccount('Bert', 'Butcher', 'SA3660I7567Q9129M9T6416V');
        const result = serializer.serialize(bankAccount);

        expect(result).toBe('{"firstName":"Bert","lastName":"Butcher","iban":"SA3660I7567Q9129M9T6416V"}');
    });

    it('with Date', () => {
        const serializer = new Serializer<CalendarEvent>();
        const event = new CalendarEvent();
        event.name = 'Birthday Party';
        event.date = new Date('2018-10-15T19:30:00+02:00');
        const result = serializer.serialize(event);
        expect(result).toBe('{"name":"Birthday Party","date":"2018-10-15T17:30:00.000Z"}');
    });
});

describe('convertCollection', () => {
    it('with class Person', () => {
        const person1 = new Person();
        person1.name = 'Daniel';
        person1.age = 31;
        const person2 = new Person();
        person2.name = 'Peter';
        person2.age = 29;

        const serializer = new Serializer();
        const result = serializer.serialize([person1, person2]);
        expect(result).toBe('[{"name":"Daniel","age":31},{"name":"Peter","age":29}]');
    });

    it('with class Accessors', () => {
        const person1 = new Accessors();
        person1.internalSetName('Daniel');
        person1.internalSetAge(31);
        const person2 = new Accessors();
        person2.internalSetName('Peter');
        person2.internalSetAge(29);

        const serializer = new Serializer();
        const result = serializer.serialize([person1, person2]);
        expect(result).toBe('[{"name":"Daniel","age":31},{"name":"Peter","age":29}]');
    });

    it('with class Person and primitives', () => {
        const person1 = new Accessors();
        person1.internalSetName('Daniel');
        person1.internalSetAge('31'); // <= must be transformed into a number
        const person2 = new Accessors();
        person2.internalSetName('Peter');
        person2.internalSetAge('29'); // <= must be transformed into a number

        const serializer = new Serializer();
        const result = serializer.serialize([person1, person2]);
        expect(result).toBe('[{"name":"Daniel","age":31},{"name":"Peter","age":29}]');
    });

    it('with class Address', () => {
        const serializer = new Serializer<Address>();
        const address1 = buildAddress('Daniel', 31, 'Mainstreet 123');
        const address2 = buildAddress('Peter', 29, 'Otherstreet 321');
        const result = serializer.serialize([address1, address2]);
        expect(result).toBe(
            '[{"person":{"name":"Daniel","age":31},"street":"Mainstreet 123"},{"person":{"name":"Peter","age":29},"street":"Otherstreet 321"}]'
        );
    });

    it('with class AddressBook (contacts array-collection)', () => {
        const serializer = new Serializer<AddressBook>();
        const addressBook1 = new AddressBook();
        addressBook1.contacts = new Map(
            [
                ['1', buildAddress('Daniel', 31, 'Mainstreet 123')],
                ['2', buildAddress('Peter', '29', 'Otherstreet 321')],
            ]
        );
        const addressBook2 = new AddressBook();
        addressBook2.contacts = new Map(
            [
                ['3', buildAddress('Bert', 54, 'Bertstreet 123')],
            ]
        );
        const result = serializer.serialize([addressBook1, addressBook2]);

        expect(result).toBe(
            '[{"contacts":{"1":{"person":{"name":"Daniel","age":31},"street":"Mainstreet 123"},"2":{"person":{"name":"Peter","age":29},"street":"Otherstreet 321"}}},{"contacts":{"3":{"person":{"name":"Bert","age":54},"street":"Bertstreet 123"}}}]'
        );

    });

    it('with class AddressBook (contacts object-collection)', () => {
        const serializer = new Serializer<AddressBook>();
        const addressBook1 = new AddressBook();
        addressBook1.contacts = new Map(
            [
                ['1', buildAddress('Daniel', 31, 'Mainstreet 123')],
                ['2', buildAddress('Peter', '29', 'Otherstreet 321')],
            ]
        );
        const addressBook2 = new AddressBook();
        addressBook2.contacts = new Map(
            [
                ['3', buildAddress('Bert', 54, 'Bertstreet 123')],
            ]
        );
        const map = new Map(
            [
                ['Daniel\'s address book', addressBook1],
                ['Sonja\'s address book', addressBook2]
            ]
        );
        const result = serializer.serialize(map);

        expect(result).toBe(
            '{"Daniel\'s address book":{"contacts":{"1":{"person":{"name":"Daniel","age":31},"street":"Mainstreet 123"},"2":{"person":{"name":"Peter","age":29},"street":"Otherstreet 321"}}},"Sonja\'s address book":{"contacts":{"3":{"person":{"name":"Bert","age":54},"street":"Bertstreet 123"}}}}'
        );
    });

    it('with class BankAccount', () => {
        const serializer = new Serializer<BankAccount>();
        const bankAccount1 = new BankAccount('Bert', 'Butcher', 'SA3660I7567Q9129M9T6416V');
        const bankAccount2 = new BankAccount('Sonja', 'Freeman', 'MR0810027200340081660307078');
        const result = serializer.serialize([bankAccount1, bankAccount2]);

        expect(result).toBe(
            '[{"firstName":"Bert","lastName":"Butcher","iban":"SA3660I7567Q9129M9T6416V"},{"firstName":"Sonja","lastName":"Freeman","iban":"MR0810027200340081660307078"}]'
        );
    });

    it('with Date', () => {
        const serializer = new Serializer<CalendarEvent>();
        const event1 = new CalendarEvent();
        event1.name = 'Birthday Party';
        event1.date = new Date('2018-10-15T19:30:00+02:00');
        const event2 = new CalendarEvent();
        event2.name = 'Summer Party';
        event2.date = new Date('2019-06-21T18:30:00+02:00');
        const result = serializer.serialize([event1, event2]);
        expect(result).toBe(
            '[{"name":"Birthday Party","date":"2018-10-15T17:30:00.000Z"},{"name":"Summer Party","date":"2019-06-21T16:30:00.000Z"}]'
        );
    });
});

describe('Handle unknown fields', () => {
    it('add', () => {
        const serializer = new Serializer<BankAccount>();
        const bankAccount = new BankAccount('Bert', 'Butcher', 'SA3660I7567Q9129M9T6416V');

        bankAccount['newProperty'] = 'something new';
        const result = serializer.serialize(bankAccount);

        expect(result).toBe(
            '{"firstName":"Bert","lastName":"Butcher","iban":"SA3660I7567Q9129M9T6416V","newProperty":"something new"}'
        );
    });
    it('deny', () => {
        const serializer = new Serializer<CalendarEvent>();
        expect(() => {
            const event = new CalendarEvent();
            event.name = 'Birthday Party';
            event.date = new Date('2018-10-15T19:30:00+02:00');
            event['newProperty'] = 'something new';

            serializer.serialize(event);
        }).toThrow('Property \'newProperty\' in \'CalendarEvent\' could not be found');
    });
});
