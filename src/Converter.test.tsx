/* tslint:disable:no-any */

import { Converter } from './Converter';
import { Address } from './Tests/Fixtures/Address';
import { AddressBook } from './Tests/Fixtures/AddressBook';
import { BankAccount } from './Tests/Fixtures/BankAccount';
import { CalendarEvent } from './Tests/Fixtures/CalendarEvent';
import { Person } from './Tests/Fixtures/Person';

class Accessors {
    get name(): string {
        return this._name;
    }

    get age(): number {
        return this._age;
    }

    private _name: string;
    private _age: number;
}

const checkClass = (result: any, ctor: (new (...a: any[]) => any)) => {
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(ctor);
};

const checkPerson = (
    result: any,
    ctor: (new () => any),
    name: string,
    age: number
) => {
    checkClass(result, ctor);
    if (result) {
        expect(result.name).toEqual(name);
        expect(result.age).toEqual(age);
    }
};
const checkAddress = (
    result: any,
    name: string,
    age: number,
    street: string
) => {
    checkClass(result, Address);
    if (result) {
        expect(result.street).toEqual(street);

        checkClass(result.person, Person);
        expect(result.person.name).toEqual(name);
        expect(result.person.age).toEqual(age);
    }
};

describe('convertSingle', () => {
    it('with class Person', () => {
        const converter = new Converter();
        const result = converter.convertSingle(
            Person,
            {
                name: 'Daniel',
                age: 31,
            }
        );
        checkPerson(result, Person, 'Daniel', 31);
    });

    it('with class Accessors', () => {
        const converter = new Converter();
        const result = converter.convertSingle(
            Accessors,
            {
                name: 'Daniel',
                age: 31,
            }
        );
        checkPerson(result, Accessors, 'Daniel', 31);
    });

    it('with class Address', () => {
        const converter = new Converter<Address>();
        const result = converter.convertSingle(
            Address,
            {
                street: 'Mainstreet 123',
                person:
                    {
                        name: 'Daniel',
                        age: 31,
                    }
            }
        );
        checkAddress(result, 'Daniel', 31, 'Mainstreet 123');
    });

    it('with class AddressBook (contacts array-collection)', () => {
        const converter = new Converter<AddressBook>();
        const result = converter.convertSingle(
            AddressBook,
            {
                contacts: [
                    {
                        street: 'Mainstreet 123',
                        person: {
                            name: 'Daniel',
                            age: 31,
                        }
                    },
                    {
                        street: 'Otherstreet 321',
                        person: {
                            name: 'Peter',
                            age: 29,
                        }
                    }
                ]
            }
        );

        checkClass(result, AddressBook);
        if (result) {
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
        const converter = new Converter<AddressBook>();
        const result = converter.convertSingle(
            AddressBook,
            {
                contacts: {
                    'daniel': {
                        street: 'Mainstreet 123',
                        person: {
                            name: 'Daniel',
                            age: 31,
                        }
                    },
                    'peter': {
                        street: 'Otherstreet 321',
                        person: {
                            name: 'Peter',
                            age: 29,
                        }
                    }
                }
            }
        );

        checkClass(result, AddressBook);
        if (result) {
            checkClass(result.contacts['daniel'], Address);
            expect(result.contacts['daniel'].street).toEqual('Mainstreet 123');
            checkClass(result.contacts['daniel'].person, Person);
            expect(result.contacts['daniel'].person.name).toEqual('Daniel');
            expect(result.contacts['daniel'].person.age).toEqual(31);

            checkClass(result.contacts['peter'], Address);
            expect(result.contacts['peter'].street).toEqual('Otherstreet 321');
            checkClass(result.contacts['peter'].person, Person);
            expect(result.contacts['peter'].person.name).toEqual('Peter');
            expect(result.contacts['peter'].person.age).toEqual(29);
        }
    });

    it('with class BankAccount', () => {
        const converter = new Converter<BankAccount>();
        const result = converter.convertSingle(
            BankAccount,
            {
                firstName: 'Bert',
                lastName: 'Butcher',
                iban: 'SA3660I7567Q9129M9T6416V'
            }
        );

        checkClass(result, BankAccount);
        if (result) {
            expect(result.firstName).toEqual('Bert');
            expect(result.lastName).toEqual('Butcher');
            expect(result.iban).toEqual('SA3660I7567Q9129M9T6416V');
        }
    });

    it('with Date', () => {
        const converter = new Converter<BankAccount>();
        const result = converter.convertSingle(
            CalendarEvent,
            {
                name: 'Birthday Party',
                date: '2018-10-15T19:30:00+02:00'
            }
        );

        checkClass(result, CalendarEvent);
        if (result) {
            expect(result.name).toEqual('Birthday Party');
            expect(result.date.valueOf()).toBe(1539624600000);
        }
    });

    it('with null value', () => {
        const converter = new Converter();
        const result1 = converter.convertSingle(Person, null);
        expect(result1).toBeNull();

        const result2 = converter.convertSingle(Accessors, null);
        expect(result2).toBeNull();
    });
});

describe('convertCollection', () => {
    it('with class Person', () => {
        const converter = new Converter();
        const result = converter.convertCollection(
            Person,
            [
                {name: 'Daniel', age: 31},
                {name: 'Peter', age: 21}
            ]
        );
        expect(result).toBeDefined();
        checkPerson(result[0], Person, 'Daniel', 31);
        checkPerson(result[1], Person, 'Peter', 21);
    });

    it('with class Accessors', () => {
        const converter = new Converter();
        const result = converter.convertCollection(
            Accessors,
            [
                {name: 'Daniel', age: 31},
                {name: 'Peter', age: 21}
            ]
        );
        expect(result).toBeDefined();
        checkPerson(result[0], Accessors, 'Daniel', 31);
        checkPerson(result[1], Accessors, 'Peter', 21);
    });

    it('with object-collection', () => {
        const converter = new Converter();
        const result = converter.convertCollection(
            Accessors,
            {
                0: {name: 'Daniel', age: 31},
                1: {name: 'Peter', age: 21},
            }
        );
        expect(result).toBeDefined();
        checkPerson(result['0'], Accessors, 'Daniel', 31);
        checkPerson(result['1'], Accessors, 'Peter', 21);
    });

    it('with class Address', () => {
        const converter = new Converter<Address>();
        const result = converter.convertCollection(
            Address,
            [
                {
                    street: 'Mainstreet 123',
                    person: {
                        name: 'Daniel',
                        age: 31,
                    }
                },
                {
                    street: 'Otherstreet 321',
                    person: {
                        name: 'Peter',
                        age: 29,
                    }
                }
            ]
        );
        checkAddress(result[0], 'Daniel', 31, 'Mainstreet 123');
        checkAddress(result[1], 'Peter', 29, 'Otherstreet 321');
    });

    it('with class BankAccount', () => {
        const converter = new Converter<BankAccount>();
        const result = converter.convertCollection(
            BankAccount,
            [
                {
                    firstName: 'Bert',
                    lastName: 'Butcher',
                    iban: 'SA3660I7567Q9129M9T6416V'
                },
                {
                    firstName: 'Barney',
                    lastName: 'Backer',
                    iban: 'ME84059360905300969554'
                }
            ]
        );

        checkClass(result[0], BankAccount);
        expect(result[0].firstName).toEqual('Bert');
        expect(result[0].lastName).toEqual('Butcher');
        expect(result[0].iban).toEqual('SA3660I7567Q9129M9T6416V');

        checkClass(result[1], BankAccount);
        expect(result[1].firstName).toEqual('Barney');
        expect(result[1].lastName).toEqual('Backer');
        expect(result[1].iban).toEqual('ME84059360905300969554');
    });
});
