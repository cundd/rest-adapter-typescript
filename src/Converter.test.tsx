/* tslint:disable:no-any */

import {Converter} from './Converter';

class Simple {
    public name: string;
    public age: number;
}

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

const checkResult = (result: any, ctor: (new () => any), name: string, age: number) => {
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(ctor);
    if (result) {
        expect(result.name).toEqual(name);
        expect(result.age).toEqual(age);
    }
};

describe('convertSingle', () => {
    it('with class Simple', () => {
        const converter = new Converter();
        const result = converter.convertSingle(
            Simple,
            {
                name: 'Daniel',
                age: 31,
            }
        );
        checkResult(result, Simple, 'Daniel', 31);
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
        checkResult(result, Accessors, 'Daniel', 31);
    });

    it('with null value', () => {
        const converter = new Converter();
        const result1 = converter.convertSingle(Simple, null);
        expect(result1).toBeNull();

        const result2 = converter.convertSingle(Accessors, null);
        expect(result2).toBeNull();
    });
});

describe('convertCollection', () => {
    it('with class Simple', () => {
        const converter = new Converter();
        const result = converter.convertCollection(
            Simple,
            [
                {name: 'Daniel', age: 31},
                {name: 'Peter', age: 21}
            ]
        );
        expect(result).toBeDefined();
        checkResult(result[0], Simple, 'Daniel', 31);
        checkResult(result[1], Simple, 'Peter', 21);
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
        checkResult(result[0], Accessors, 'Daniel', 31);
        checkResult(result[1], Accessors, 'Peter', 21);
    });
});
