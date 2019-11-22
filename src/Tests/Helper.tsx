import { Address } from './Fixtures/Address';
import { Person } from './Fixtures/Person';

export function checkClass<T>(result: T | any, ctor: (new (...a: any[]) => T)): result is T {
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(ctor);

    return true;
}

export const checkPerson = (
    result: any,
    ctor: (new () => any),
    name: string,
    age: number | undefined | null,
    isDeveloper?: boolean
): void => {
    checkClass(result, ctor);
    if (result) {
        expect(result.name).toEqual(name);
        expect(result.age).toEqual(age);
        if (typeof isDeveloper !== 'undefined') {
            expect(result.isDeveloper).toEqual(isDeveloper);
        }
    }
};
export const checkAddress = (
    result: any,
    name: string,
    age: number,
    street: string
): void => {
    checkClass(result, Address);
    if (result) {
        expect(result.street).toEqual(street);

        checkClass(result.person, Person);
        expect(result.person.name).toEqual(name);
        expect(result.person.age).toEqual(age);
    }
};
