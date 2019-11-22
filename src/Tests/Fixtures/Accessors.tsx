import { ra_property } from '../..';

export class Accessors {
    get name(): string {
        return this._name;
    }

    get age(): number {
        return this._age;
    }

    @ra_property('name')
    private _name: string;

    @ra_property('age')
    private _age: number;

    public internalSetName(name: string): void {
        this._name = name;
    }

    public internalSetAge(age: number | string): void {
        this._age = age as any;
    }
}
