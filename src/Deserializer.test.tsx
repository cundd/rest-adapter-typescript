import { Deserializer } from './Deserializer';
import { Accessors } from './Tests/Fixtures/Accessors';
import { Address } from './Tests/Fixtures/Address';
import { AddressBook } from './Tests/Fixtures/AddressBook';
import { BankAccount } from './Tests/Fixtures/BankAccount';
import { CalendarEvent } from './Tests/Fixtures/CalendarEvent';
import { Person } from './Tests/Fixtures/Person';
import { checkAddress, checkClass, checkPerson } from './Tests/Helper';

describe('deserialize single', () => {
    it('with class Person', () => {
        const converter = new Deserializer();
        const result = converter.deserialize(Person, '{"name":"Daniel","age":31}');
        checkPerson(result, Person, 'Daniel', 31);
    });

    it('with class Accessors', () => {
        const converter = new Deserializer();
        const result = converter.deserialize(Accessors, '{"name":"Daniel","age":31}');
        checkPerson(result, Accessors, 'Daniel', 31);
    });

    it('with class Person and primitives', () => {
        const converter = new Deserializer();
        const result = converter.deserialize(Person, '{"name":"Daniel","age":"52"}');
        checkPerson(result, Person, 'Daniel', 52);
    });

    it('with class Address', () => {
        const converter = new Deserializer<Address>();
        const result = converter.deserialize(
            Address,
            '{"person":{"name":"Daniel","age":31},"street":"Mainstreet 123"}'
        );
        checkAddress(result, 'Daniel', 31, 'Mainstreet 123');
    });

    it('with class AddressBook (contacts array-collection)', () => {
        const converter = new Deserializer<AddressBook>();
        const result = converter.deserialize(
            AddressBook,
            '{"contacts":[{"person":{"name":"Daniel","age":31},"street":"Mainstreet 123"},{"person":{"name":"Peter","age":29},"street":"Otherstreet 321"}]}'
        );
        if (checkClass(result, AddressBook)) {
            checkClass(result.contacts[0], Address);
            expect(result.contacts[0].street).toEqual('Mainstreet 123');
            checkClass(result.contacts[0].person, Person);
            expect(result.contacts[0].person.name).toEqual('Daniel');
            expect(result.contacts[0].person.age).toEqual(31);

            checkClass(result.contacts[1], Address);
            expect(result.contacts[1].street).toEqual('Otherstreet 321');
            checkClass(result.contacts[1].person, Person);
            expect(result.contacts[1].person.name).toEqual('Peter');
            expect(result.contacts[1].person.age).toEqual(29);
        }
    });

    it('with class AddressBook (contacts object-collection)', () => {
        const converter = new Deserializer<AddressBook>();
        const result = converter.deserialize(
            AddressBook,
            '{"contacts":{"daniel":{"person":{"name":"Daniel","age":31},"street":"Mainstreet 123"},"peter":{"person":{"name":"Peter","age":29},"street":"Otherstreet 321"}}}'
        );

        if (checkClass(result, AddressBook)) {
            const contactDaniel = result.contacts.get('daniel');
            checkClass(contactDaniel, Address);
            if (contactDaniel) {
                expect(contactDaniel.street).toEqual('Mainstreet 123');
                checkClass(contactDaniel.person, Person);
                expect(contactDaniel.person.name).toEqual('Daniel');
                expect(contactDaniel.person.age).toEqual(31);
            }
            const contactPeter = result.contacts.get('peter');
            checkClass(contactPeter, Address);
            if (contactPeter) {
                expect(contactPeter.street).toEqual('Otherstreet 321');
                checkClass(contactPeter.person, Person);
                expect(contactPeter.person.name).toEqual('Peter');
                expect(contactPeter.person.age).toEqual(29);
            }
        }
    });

    it('with class BankAccount', () => {
        const converter = new Deserializer<BankAccount>();
        const result = converter.deserialize(
            BankAccount,
            '{"firstName":"Bert","lastName":"Butcher","iban":"SA3660I7567Q9129M9T6416V"}'
        );

        if (checkClass(result, BankAccount)) {
            expect(result.firstName).toEqual('Bert');
            expect(result.lastName).toEqual('Butcher');
            expect(result.iban).toEqual('SA3660I7567Q9129M9T6416V');
        }
    });

    it('with Date', () => {
        const converter = new Deserializer<CalendarEvent>();
        const result = converter.deserialize(
            CalendarEvent,
            '{"name":"Birthday Party","date":"2018-10-15T17:30:00.000Z"}'
        );

        if (checkClass(result, CalendarEvent)) {
            expect(result.name).toEqual('Birthday Party');
            expect(result.date.valueOf()).toBe(1539624600000);
        }
    });

    it('with null value', () => {
        const converter = new Deserializer();
        expect(() => {
            converter.deserialize(Person, '');
        }).toThrowError('Input must not be empty');
        expect(() => {
            converter.deserialize(Accessors, '');
        }).toThrowError('Input must not be empty');
        expect(() => {
            converter.deserialize(Person, null as any);
        }).toThrowError('Input must not be empty');
        expect(() => {
            converter.deserialize(Accessors, null as any);
        }).toThrowError('Input must not be empty');
    });
});

describe('deserialize collection', () => {
    it('with class Person', () => {
        const converter = new Deserializer();
        const result = converter.deserialize(
            Person,
            '[{"name":"Daniel","age":31},{"name":"Peter","age":29}]'
        );
        expect(result).toBeDefined();
        if (result) {
            checkPerson(result[0], Person, 'Daniel', 31);
            checkPerson(result[1], Person, 'Peter', 29);
        }
    });

    it('with class Accessors', () => {
        const converter = new Deserializer();
        const result = converter.deserialize(
            Accessors,
            '[{"name":"Daniel","age":31},{"name":"Peter","age":29}]'
        );
        expect(result).toBeDefined();
        checkPerson(result[0], Accessors, 'Daniel', 31);
        checkPerson(result[1], Accessors, 'Peter', 29);
    });

    it('with class Person with primitives', () => {
        const converter = new Deserializer();
        const result = converter.deserialize(
            Person,
            '[{"name":"Daniel","age":"31"},{"name":"Peter","age":"29"}]'
        );
        expect(result).toBeDefined();
        checkPerson(result[0], Person, 'Daniel', 31);
        checkPerson(result[1], Person, 'Peter', 29);
    });

    it('with class Address', () => {
        const converter = new Deserializer<Address>();
        const result = converter.deserialize(
            Address,
            '[{"person":{"name":"Daniel","age":31},"street":"Mainstreet 123"},{"person":{"name":"Peter","age":29},"street":"Otherstreet 321"}]'
        );
        checkAddress(result[0], 'Daniel', 31, 'Mainstreet 123');
        checkAddress(result[1], 'Peter', 29, 'Otherstreet 321');
    });

    it('with class BankAccount', () => {
        const converter = new Deserializer<BankAccount>();
        const result = converter.deserialize(
            BankAccount,
            '[{"firstName":"Bert","lastName":"Butcher","iban":"SA3660I7567Q9129M9T6416V"},{"firstName":"Sonja","lastName":"Freeman","iban":"MR0810027200340081660307078"}]'
        );

        checkClass(result[0], BankAccount);
        expect(result[0].firstName).toEqual('Bert');
        expect(result[0].lastName).toEqual('Butcher');
        expect(result[0].iban).toEqual('SA3660I7567Q9129M9T6416V');

        checkClass(result[1], BankAccount);
        expect(result[1].firstName).toEqual('Sonja');
        expect(result[1].lastName).toEqual('Freeman');
        expect(result[1].iban).toEqual('MR0810027200340081660307078');
    });
});

describe('Handle unknown fields', () => {
    it('add', () => {
        const converter = new Deserializer<BankAccount>();
        const result = converter.deserialize(
            BankAccount,
            '{"firstName":"Bert","lastName":"Butcher","iban":"SA3660I7567Q9129M9T6416V","newProperty":"something new"}'
        );

        if (checkClass(result, BankAccount)) {
            expect(result.firstName).toEqual('Bert');
            expect(result.lastName).toEqual('Butcher');
            expect(result.iban).toEqual('SA3660I7567Q9129M9T6416V');
            expect(result['newProperty']).toEqual('something new');
        }
    });
    it('deny', () => {
        const converter = new Deserializer<CalendarEvent>();
        expect(() => {
            converter.deserialize(
                CalendarEvent,
                '{"name":"Birthday Party","date":"2018-10-15T17:30:00.000Z","newProperty":"something new"}'
            );
        }).toThrow('Property \'newProperty\' could not be found in \'(object) CalendarEvent\'');
    });
});
