import { Type } from '../../TypeDecorator';
import { Person } from './Person';

export class Address {
    @Type(Person)
    private _person: Person;

    private _street: string;

    get street(): string {
        return this._street;
    }

    get person(): Person {
        return this._person;
    }
}
