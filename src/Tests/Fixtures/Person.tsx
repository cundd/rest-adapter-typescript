import { ra_property } from '../../TypeDecorator';

export class Person {
    @ra_property()
    public name: string;

    @ra_property()
    public age: number;

    @ra_property()
    public isDeveloper: boolean;
}
