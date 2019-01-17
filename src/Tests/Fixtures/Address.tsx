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
}
