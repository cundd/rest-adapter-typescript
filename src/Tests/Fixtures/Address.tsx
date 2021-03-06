import { PropertyTypeOptions, ra, ra_property } from '../../TypeDecorator';
import { Person } from './Person';

@ra()
export class Address {
    @ra_property('person')
    private _person: Person;

    @ra_property('street', PropertyTypeOptions.None)
    private _street: string;

    get street(): string {
        return this._street;
    }

    get person(): Person {
        return this._person;
    }

    public internalSetStreet(value: string): void {
        this._street = value;
    }

    public internalSetPerson(value: Person | undefined | null): void {
        this._person = value as any;
    }
}

