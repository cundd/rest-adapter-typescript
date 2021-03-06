import { Converter } from './Converter';
import { Deserializer } from './Deserializer';
import { Serializer } from './Serializer';
import { Accessors } from './Tests/Fixtures/Accessors';
import { Address } from './Tests/Fixtures/Address';
import { AddressBook } from './Tests/Fixtures/AddressBook';
import { BankAccount } from './Tests/Fixtures/BankAccount';
import { CalendarEvent } from './Tests/Fixtures/CalendarEvent';
import { Person } from './Tests/Fixtures/Person';
import { checkAddress, checkClass, checkPerson } from './Tests/Helper';

describe('convertSingle', () => {
    it('with class Person', () => {
        const serializer = new Serializer();
        const converter = new Converter();
        const deserializer = new Deserializer();
        const result = deserializer.deserialize(
            Person,
            serializer.serialize(
                converter.convertSingle(
                    Person,
                    {
                        name: 'Daniel',
                        age: 31,
                    }
                )
            )
        );

        checkPerson(result, Person, 'Daniel', 31);
    });

    it('with class Accessors', () => {
        const serializer = new Serializer();
        const converter = new Converter();
        const deserializer = new Deserializer();
        const result = deserializer.deserialize(
            Accessors,
            serializer.serialize(
                converter.convertSingle(
                    Accessors,
                    {
                        name: 'Daniel',
                        age: 31,
                    }
                )
            )
        );
        checkPerson(result, Accessors, 'Daniel', 31);
    });

    it('with class Person and primitives', () => {
        const serializer = new Serializer();
        const converter = new Converter();
        const deserializer = new Deserializer();
        const result = deserializer.deserialize(
            Person,
            serializer.serialize(
                converter.convertSingle(
                    Person,
                    {
                        name: 'Daniel',
                        age: '32',
                    }
                )
            )
        );
        checkPerson(result, Person, 'Daniel', 32);
    });

    it('with class Address', () => {
        const serializer = new Serializer();
        const converter = new Converter<Address>();
        const deserializer = new Deserializer();
        const result = deserializer.deserialize(
            Address,
            serializer.serialize(
                converter.convertSingle(
                    Address,
                    {
                        street: 'Mainstreet 123',
                        person:
                            {
                                name: 'Daniel',
                                age: 31,
                            }
                    }
                )
            )
        );
        checkAddress(result, 'Daniel', 31, 'Mainstreet 123');
    });

    it('with class AddressBook (contacts array-collection)', () => {
        const serializer = new Serializer();
        const converter = new Converter<AddressBook>();
        const deserializer = new Deserializer();
        const result = deserializer.deserialize(
            AddressBook,
            serializer.serialize(
                converter.convertSingle(
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
                )
            )
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
        const serializer = new Serializer<AddressBook>();
        const converter = new Converter<AddressBook>();
        const deserializer = new Deserializer();
        const result = deserializer.deserialize(
            AddressBook,
            serializer.serialize(
                converter.convertSingle(
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
                )
            )
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
        const serializer = new Serializer<BankAccount>();
        const converter = new Converter<BankAccount>();
        const deserializer = new Deserializer();
        const result = deserializer.deserialize(
            BankAccount,
            serializer.serialize(
                converter.convertSingle(
                    BankAccount,
                    {
                        firstName: 'Bert',
                        lastName: 'Butcher',
                        iban: 'SA3660I7567Q9129M9T6416V'
                    }
                )
            )
        );

        if (checkClass(result, BankAccount)) {
            expect(result.firstName).toEqual('Bert');
            expect(result.lastName).toEqual('Butcher');
            expect(result.iban).toEqual('SA3660I7567Q9129M9T6416V');
        }
    });

    it('with Date', () => {
        const serializer = new Serializer<CalendarEvent>();
        const converter = new Converter<CalendarEvent>();
        const deserializer = new Deserializer();
        const result = deserializer.deserialize(
            CalendarEvent,
            serializer.serialize(
                converter.convertSingle(
                    CalendarEvent,
                    {
                        name: 'Birthday Party',
                        date: '2018-10-15T19:30:00+02:00'
                    }
                )
            )
        );

        if (checkClass(result, CalendarEvent)) {
            expect(result.name).toEqual('Birthday Party');
            expect(result.date.valueOf()).toBe(1539624600000);
        }
    });
});

describe('convertCollection', () => {
    it('with class Person', () => {
        const serializer = new Serializer();
        const converter = new Converter();
        const deserializer = new Deserializer();
        const result = deserializer.deserialize(
            Person,
            serializer.serialize(
                converter.convertCollection(
                    Person,
                    [
                        {name: 'Daniel', age: 31},
                        {name: 'Peter', age: 21}
                    ]
                )
            )
        );
        expect(result).toBeDefined();
        checkPerson(result[0], Person, 'Daniel', 31);
        checkPerson(result[1], Person, 'Peter', 21);
    });

    it('with class Accessors', () => {
        const serializer = new Serializer();
        const converter = new Converter();
        const deserializer = new Deserializer();
        const result = deserializer.deserialize(
            Accessors,
            serializer.serialize(
                converter.convertCollection(
                    Accessors,
                    [
                        {name: 'Daniel', age: 31},
                        {name: 'Peter', age: 21}
                    ]
                )
            )
        );
        expect(result).toBeDefined();
        checkPerson(result[0], Accessors, 'Daniel', 31);
        checkPerson(result[1], Accessors, 'Peter', 21);
    });

    it('with class Person with primitives', () => {
        const serializer = new Serializer();
        const converter = new Converter();
        const deserializer = new Deserializer();
        const result = deserializer.deserialize(
            Person,
            serializer.serialize(
                converter.convertCollection(
                    Person,
                    [
                        {name: 'Daniel', age: 31},
                        {name: 'Peter', age: '21'}
                    ]
                )
            )
        );
        expect(result).toBeDefined();
        checkPerson(result[0], Person, 'Daniel', 31);
        checkPerson(result[1], Person, 'Peter', 21);
    });

    it('with object-collection', () => {
        // Deserializing into a Map is not supported by the Deserializer
        const serializer = new Serializer();
        const converter = new Converter();
        const result = converter.convertCollection(
            Accessors,
            JSON.parse(
                serializer.serialize(
                    converter.convertCollection(
                        Accessors,
                        {
                            'daniel': {name: 'Daniel', age: 31},
                            'peter': {name: 'Peter', age: 21},
                        }
                    )
                )
            )
        ) as Map<string, Accessors>;
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(2);

        checkPerson(result.get('daniel'), Accessors, 'Daniel', 31);
        checkPerson(result.get('peter'), Accessors, 'Peter', 21);
    });

    it('with class Address', () => {
        const serializer = new Serializer<Address>();
        const converter = new Converter<Address>();
        const deserializer = new Deserializer();
        const result = deserializer.deserialize(
            Address,
            serializer.serialize(
                converter.convertCollection(
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
                )
            )
        );
        checkAddress(result[0], 'Daniel', 31, 'Mainstreet 123');
        checkAddress(result[1], 'Peter', 29, 'Otherstreet 321');
    });

    it('with class BankAccount', () => {
        const serializer = new Serializer<BankAccount>();
        const converter = new Converter<BankAccount>();
        const deserializer = new Deserializer();
        const result = deserializer.deserialize(
            BankAccount,
            serializer.serialize(
                converter.convertCollection(
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
                )
            )
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

describe('Handle unknown fields', () => {
    it('add', () => {
        const serializer = new Serializer<BankAccount>();
        const converter = new Converter<BankAccount>();
        const deserializer = new Deserializer();
        const result = deserializer.deserialize(
            BankAccount,
            serializer.serialize(
                converter.convertSingle(
                    BankAccount,
                    {
                        firstName: 'Bert',
                        lastName: 'Butcher',
                        iban: 'SA3660I7567Q9129M9T6416V',
                        newProperty: 'something new'
                    }
                )
            )
        );

        if (checkClass(result, BankAccount)) {
            expect(result.firstName).toEqual('Bert');
            expect(result.lastName).toEqual('Butcher');
            expect(result.iban).toEqual('SA3660I7567Q9129M9T6416V');
            expect(result['newProperty']).toEqual('something new');
        }
    });
});
