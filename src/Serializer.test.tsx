import 'reflect-metadata';
import { Serializer } from './Serializer';
import { Accessors } from './Tests/Fixtures/Accessors';
import { Address } from './Tests/Fixtures/Address';
import { AddressBook } from './Tests/Fixtures/AddressBook';
import { BankAccount } from './Tests/Fixtures/BankAccount';
import { CalendarEvent } from './Tests/Fixtures/CalendarEvent';
import { Person } from './Tests/Fixtures/Person';
import { PropertyTypeOptions, ra_property } from './TypeDecorator/PropertyLevel';

function buildAddress(name: string, age: number | string, street: string) {
    const address = new Address();
    const person = new Person();
    person.name = name;
    person.age = age as number;
    address.internalSetPerson(person);
    address.internalSetStreet(street);

    return address;
}

enum StringEnum {
    On = 'on',
    Off = 'off'
}

enum NumberEnum {
    On = 1,
    Off = 0
}

class PrivateData {
    @ra_property()
    public name: string;

    @ra_property(String, PropertyTypeOptions.NoSerialization)
    public privateKey: string;

    constructor(name: string, privateKey: string) {
        this.name = name;
        this.privateKey = privateKey;
    }
}

class WrapperWithRename {
    @ra_property()
    public name: string;

    @ra_property(Person, 'person')
    public _person: Person;

    constructor(name: string, person: Person) {
        this.name = name;
        this._person = person;
    }
}

class StringEnumWrapper {
    @ra_property()
    public state?: StringEnum;

    constructor(state?: StringEnum) {
        this.state = state;
    }
}

class NumberEnumWrapper {
    @ra_property()
    public state?: NumberEnum;

    constructor(state?: NumberEnum) {
        this.state = state;
    }
}

class GenericEnumWrapper<T extends (NumberEnum | StringEnum)> {
    @ra_property()
    public state?: T;

    constructor(state?: T) {
        this.state = state;
    }
}

class EnumWrapperWithRename {
    @ra_property('state')
    private readonly _state?: StringEnum;

    constructor(state?: StringEnum) {
        this._state = state;
    }

    get state(): StringEnum | undefined {
        return this._state;
    }
}

class AnyWrapper {
    @ra_property()
    public value: any;

    public internalSetValue(value: any): this {
        this.value = value;
        return this;
    }
}

class AnyWrapperWithRename {
    @ra_property('value')
    private _value: any;

    get value(): any {
        return this._value;
    }

    public internalSetValue(value: any): this {
        this._value = value;
        return this;
    }
}

class StringList {
    @ra_property(String, PropertyTypeOptions.Multiple, 'items')
    private readonly _items?: string[];

    get items(): any {
        return this._items;
    }

    constructor(items?: string[]) {
        this._items = items;
    }
}

describe('serialize', () => {
    it('with class Person', () => {
        const person = new Person();
        person.name = 'Daniel';
        person.age = 31;

        const serializer = new Serializer();
        const result = serializer.serialize(person);
        expect(result).toBe('{"name":"Daniel","age":31,"isDeveloper":null}');
    });

    it('with primitive Classes', () => {
        const person = new Person();

        // noinspection JSPrimitiveTypeWrapperUsage
        const stringObject = new String('Daniel');
        person.name = stringObject as string;

        // noinspection JSPrimitiveTypeWrapperUsage
        const numberObject = new Number(31);
        person.age = numberObject as number;

        const serializer = new Serializer();
        const result = serializer.serialize(person);
        expect(result).toBe('{"name":"Daniel","age":31,"isDeveloper":null}');
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
        expect(result).toBe('{"person":{"name":"Daniel","age":31,"isDeveloper":null},"street":"Mainstreet 123"}');
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
            '{"contacts":{"1":{"person":{"name":"Daniel","age":31,"isDeveloper":null},"street":"Mainstreet 123"},"2":{"person":{"name":"Peter","age":29,"isDeveloper":null},"street":"Otherstreet 321"}}}'
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
            '{"contacts":{"daniel":{"person":{"name":"Daniel","age":31,"isDeveloper":null},"street":"Mainstreet 123"},"peter":{"person":{"name":"Peter","age":29,"isDeveloper":null},"street":"Otherstreet 321"}}}'
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

    it('with PrivateData', () => {
        const serializer = new Serializer<CalendarEvent>();
        const data = new PrivateData(
            'Daniel',
            '-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQCqGKukO1De7zhZj6+H0qtjTkVxwTC'
        );
        const result = serializer.serialize(data);
        expect(result).toBe('{"name":"Daniel"}');
    });

    it('with property renaming', () => {
        const person = new Person();
        person.name = 'Daniel';
        const serializer = new Serializer<CalendarEvent>();
        const data = new WrapperWithRename(
            'Burrito',
            person
        );
        const result = serializer.serialize(data);
        expect(result).toBe('{"name":"Burrito","person":{"name":"Daniel","age":null,"isDeveloper":null}}');
    });

    describe('with primitives array', () => {
        it('without StringList', () => {
            const serializer = new Serializer();

            const instance = (new StringList());
            expect(serializer.serialize(instance)).toBe('{"items":null}');
        });

        it('with empty StringList', () => {
            const serializer = new Serializer();

            const instance = (new StringList([]));
            expect(serializer.serialize(instance)).toBe('{"items":[]}');
        });

        it('with StringList', () => {
            const serializer = new Serializer();

            const instance = (new StringList(['a', 'b', 'c']));
            expect(serializer.serialize(instance)).toBe('{"items":["a","b","c"]}');
        });
    });

    describe('with any', () => {
        const testSuites = [
            {
                value: 'hello',
                expected: '{"value":"hello"}'
            },
            {
                value: 100,
                expected: '{"value":100}'
            },
            {
                value: [1, 2, 3],
                expected: '{"value":[1,2,3]}'
            },
            {
                value: {name: 'Daniel'},
                expected: '{"value":{"name":"Daniel"}}'
            },
            {
                value: StringEnum.On,
                expected: '{"value":"on"}'
            },
            {
                value: undefined,
                expected: '{"value":null}'
            },
            {
                value: null,
                expected: '{"value":null}'
            }
        ];

        it('with any', () => {
            const serializer = new Serializer();

            testSuites.forEach(
                ({value, expected}) => {
                    const instance = (new AnyWrapper()).internalSetValue(value);
                    expect(serializer.serialize(instance)).toBe(expected);
                }
            );

            {
                const instance = new AnyWrapper();
                expect(serializer.serialize(instance)).toBe('{"value":null}');
            }
        });
        it('with rename', () => {
            const serializer = new Serializer();

            testSuites.forEach(
                ({value, expected}) => {
                    const instance = (new AnyWrapperWithRename()).internalSetValue(value);
                    expect(serializer.serialize(instance)).toBe(expected);
                }
            );

            {
                const instance = new AnyWrapperWithRename();
                expect(serializer.serialize(instance)).toBe('{"value":null}');
            }
        });
    });
    describe('with Enum', () => {
        it('with String Enum', () => {
            const serializer = new Serializer();
            {
                const instance = new StringEnumWrapper(StringEnum.On);
                expect(serializer.serialize(instance)).toBe('{"state":"on"}');
            }
            {
                const instance = new StringEnumWrapper(StringEnum.Off);
                expect(serializer.serialize(instance)).toBe('{"state":"off"}');
            }
            {
                const instance = new StringEnumWrapper();
                expect(serializer.serialize(instance)).toBe('{"state":null}');
            }
        });

        it('with Number Enum', () => {
            const serializer = new Serializer();
            {
                const instance = new NumberEnumWrapper(NumberEnum.On);
                expect(serializer.serialize(instance)).toBe('{"state":1}');
            }
            {
                const instance = new NumberEnumWrapper(NumberEnum.Off);
                expect(serializer.serialize(instance)).toBe('{"state":0}');
            }
            {
                const instance = new NumberEnumWrapper();
                expect(serializer.serialize(instance)).toBe('{"state":null}');
            }

        });

        it('with Enum with property rename', () => {
            const serializer = new Serializer();
            {
                const instance = new EnumWrapperWithRename(StringEnum.On);
                expect(serializer.serialize(instance)).toBe('{"state":"on"}');
            }
            {
                const instance = new EnumWrapperWithRename(StringEnum.Off);
                expect(serializer.serialize(instance)).toBe('{"state":"off"}');
            }
            {
                const instance = new EnumWrapperWithRename();
                expect(serializer.serialize(instance)).toBe('{"state":null}');
            }
        });
        it('with generic Enum', () => {
            const serializer = new Serializer();
            {
                const instance = new GenericEnumWrapper(StringEnum.On);
                expect(serializer.serialize(instance)).toBe('{"state":"on"}');
            }
            {
                const instance = new GenericEnumWrapper(StringEnum.Off);
                expect(serializer.serialize(instance)).toBe('{"state":"off"}');
            }
            {
                const instance = new GenericEnumWrapper();
                expect(serializer.serialize(instance)).toBe('{"state":null}');
            }
        });
    });

    describe('with null values', () => {
        it('with null value', () => {
            const serializer = new Serializer();
            const result1 = serializer.serialize(null);
            expect(result1).toBe('null');

            const result2 = serializer.serialize(null);
            expect(result2).toBe('null');
        });

        it('with null property', () => {
            const serializer = new Serializer();
            const address = new Address();
            address.internalSetStreet('Mainstreet 123');
            address.internalSetPerson(null);
            const result = serializer.serialize(address);
            expect(result).toBe('{"person":null,"street":"Mainstreet 123"}');
        });

        it('with undefined property', () => {
            const serializer = new Serializer();
            const address = new Address();
            address.internalSetStreet('Mainstreet 123');
            address.internalSetPerson(undefined);
            const result = serializer.serialize(address);
            expect(result).toBe('{"person":null,"street":"Mainstreet 123"}');
        });

        it('with empty Multiple-value property', () => {
            const serializer = new Serializer<AddressBook>();
            const addressBook1 = new AddressBook();
            addressBook1.contacts = new Map;
            const result = serializer.serialize(addressBook1);

            expect(result).toBe('{"contacts":{}}');
        });
    });

    describe('with collections', () => {
        it('with class Person', () => {
            const person1 = new Person();
            person1.name = 'Daniel';
            person1.age = 31;
            const person2 = new Person();
            person2.name = 'Peter';
            person2.age = 29;

            const serializer = new Serializer();
            const result = serializer.serialize([person1, person2]);
            expect(result).toBe(
                '[{"name":"Daniel","age":31,"isDeveloper":null},{"name":"Peter","age":29,"isDeveloper":null}]');
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
                '[{"person":{"name":"Daniel","age":31,"isDeveloper":null},"street":"Mainstreet 123"},{"person":{"name":"Peter","age":29,"isDeveloper":null},"street":"Otherstreet 321"}]'
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
                '[{"contacts":{"1":{"person":{"name":"Daniel","age":31,"isDeveloper":null},"street":"Mainstreet 123"},"2":{"person":{"name":"Peter","age":29,"isDeveloper":null},"street":"Otherstreet 321"}}},{"contacts":{"3":{"person":{"name":"Bert","age":54,"isDeveloper":null},"street":"Bertstreet 123"}}}]'
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
                '{"Daniel\'s address book":{"contacts":{"1":{"person":{"name":"Daniel","age":31,"isDeveloper":null},"street":"Mainstreet 123"},"2":{"person":{"name":"Peter","age":29,"isDeveloper":null},"street":"Otherstreet 321"}}},"Sonja\'s address book":{"contacts":{"3":{"person":{"name":"Bert","age":54,"isDeveloper":null},"street":"Bertstreet 123"}}}}'
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
        }).toThrow('Property \'newProperty\' in \'(object) CalendarEvent\' could not be found');
    });
});
