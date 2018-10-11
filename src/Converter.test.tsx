/* tslint:disable:no-any */

import { Converter } from './Converter';
import { Address } from './Tests/Fixtures/Address';
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

const checkClass = (result: any, ctor: (new () => any)) => {
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
    ctor: (new () => any),
    name: string,
    age: number,
    street: string
) => {
    checkClass(result, ctor);
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
        checkAddress(result, Address, 'Daniel', 31, 'Mainstreet 123');
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
        checkAddress(result[0], Address, 'Daniel', 31, 'Mainstreet 123');
        checkAddress(result[1], Address, 'Peter', 29, 'Otherstreet 321');
    });
});
