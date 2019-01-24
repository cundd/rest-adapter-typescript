/* tslint:disable:no-any */

import { Converter } from './Converter';
import { Accessors } from './Tests/Fixtures/Accessors';
import { Address } from './Tests/Fixtures/Address';
import { AddressBook } from './Tests/Fixtures/AddressBook';
import { BankAccount } from './Tests/Fixtures/BankAccount';
import { CalendarEvent } from './Tests/Fixtures/CalendarEvent';
import { Nested, NestedWithInterface, NestedWithParentAndInterface } from './Tests/Fixtures/Nested';
import { Person } from './Tests/Fixtures/Person';
import { checkAddress, checkClass, checkPerson } from './Tests/Helper';

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

    it('with class Person with undefined age', () => {
        const converter = new Converter();
        const result = converter.convertSingle(
            Person,
            {
                name: 'Daniel',
                age: undefined,
            }
        );
        checkPerson(result, Person, 'Daniel', undefined);
    });

    it('with class Person with null age', () => {
        const converter = new Converter();
        const result = converter.convertSingle(
            Person,
            {
                name: 'Daniel',
                age: null,
            }
        );
        checkPerson(result, Person, 'Daniel', null);
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

    it('with class Person and primitives', () => {
        const converter = new Converter();
        const result = converter.convertSingle(
            Person,
            {
                name: 'Daniel',
                age: '32',
            }
        );
        checkPerson(result, Person, 'Daniel', 32);
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
                            age: '29',
                        }
                    }
                ]
            }
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
        const converter = new Converter<BankAccount>();
        const result = converter.convertSingle(
            BankAccount,
            {
                firstName: 'Bert',
                lastName: 'Butcher',
                iban: 'SA3660I7567Q9129M9T6416V'
            }
        );

        if (checkClass(result, BankAccount)) {
            expect(result.firstName).toEqual('Bert');
            expect(result.lastName).toEqual('Butcher');
            expect(result.iban).toEqual('SA3660I7567Q9129M9T6416V');
        }
    });

    it('with Date', () => {
        const converter = new Converter<CalendarEvent>();
        const result = converter.convertSingle(
            CalendarEvent,
            {
                name: 'Birthday Party',
                date: '2018-10-15T19:30:00+02:00'
            }
        );

        if (checkClass(result, CalendarEvent)) {
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

    it('with class Person with primitives', () => {
        const converter = new Converter();
        const result = converter.convertCollection(
            Person,
            [
                {name: 'Daniel', age: 31},
                {name: 'Peter', age: '21'}
            ]
        );
        expect(result).toBeDefined();
        checkPerson(result[0], Person, 'Daniel', 31);
        checkPerson(result[1], Person, 'Peter', 21);
    });

    it('with object-collection', () => {
        const converter = new Converter();
        const result = converter.convertCollection(
            Accessors,
            {
                'daniel': {name: 'Daniel', age: 31},
                'peter': {name: 'Peter', age: 21},
            }
        ) as Map<string, Accessors>;
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(2);

        checkPerson(result.get('daniel'), Accessors, 'Daniel', 31);
        checkPerson(result.get('peter'), Accessors, 'Peter', 21);
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

describe('Nesting', () => {
    const nestedData = {
        inner: {
            a: {
                name: 'Name A'
            },
            b: {
                name: 'Name B',
                description: 'Description B'
            },
            c: {
                name: 'Name C',
                description: 'Description C',
                b: {
                    name: 'Name C B',
                    description: 'Description C B'
                }
            },
        }
    };

    function testNested<T extends Partial<Nested>>(result: any, ctor: (new (...a: any[]) => T)) {
        if (checkClass(result, ctor)) {
            expect(result.inner).not.toBeUndefined();
            if (result.inner) {
                expect(result.inner.a).not.toBeUndefined();
                if (result.inner.a) {
                    expect(result.inner.a.name).toEqual('Name A');
                }
                expect(result.inner.b.name).toEqual('Name B');
                expect(result.inner.b.description).toEqual('Description B');

                expect(result.inner.c).not.toBeUndefined();
                if (result.inner.c) {
                    expect(result.inner.c.description).toEqual('Description C');
                    expect(result.inner.c.b.name).toEqual('Name C B');
                    expect(result.inner.c.b.description).toEqual('Description C B');
                    expect(result.inner.c.computed).toEqual('Computed Name C B');
                }
            }
        }
    }

    it('without normal class', () => {
        const converter = new Converter<Nested>();
        testNested(converter.convertSingle(Nested, nestedData), Nested);
    });

    it('with interface', () => {
        const converter = new Converter<NestedWithInterface>();
        testNested(converter.convertSingle(NestedWithInterface, nestedData), NestedWithInterface);
    });

    it('without interface and parent', () => {
        const converter = new Converter<NestedWithParentAndInterface>();
        testNested(converter.convertSingle(NestedWithParentAndInterface, nestedData), NestedWithParentAndInterface);
    });

    it('without property `a`', () => {
        const converter = new Converter<Nested>();
        const result = converter.convertSingle(
            Nested,
            {
                inner: {
                    b: {
                        name: 'Test',
                        description: 'Description B'
                    },
                }
            }
        );

        if (checkClass(result, Nested)) {
            expect(result.inner.b.name).toEqual('Test');
            expect(result.inner.b.description).toEqual('Description B');
        }
    });
});

describe('Handle unknown fields', () => {
    it('add', () => {
        const converter = new Converter<BankAccount>();
        const result = converter.convertSingle(
            BankAccount,
            {
                firstName: 'Bert',
                lastName: 'Butcher',
                iban: 'SA3660I7567Q9129M9T6416V',
                newProperty: 'something new'
            }
        );

        if (checkClass(result, BankAccount)) {
            expect(result.firstName).toEqual('Bert');
            expect(result.lastName).toEqual('Butcher');
            expect(result.iban).toEqual('SA3660I7567Q9129M9T6416V');
            expect(result['newProperty']).toEqual('something new');
        }
    });
    it('deny', () => {
        const converter = new Converter<CalendarEvent>();
        expect(() => {
            converter.convertSingle(
                CalendarEvent,
                {
                    newProperty: 'something new'
                }
            );
        }).toThrow('Property \'newProperty\' could not be found in \'CalendarEvent\'');
    });
});
