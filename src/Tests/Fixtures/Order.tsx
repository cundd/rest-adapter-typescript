import { PropertyTypeOptions, ra_property } from '../../TypeDecorator';
import { Address } from './Address';

export class Order {
    @ra_property(Address, PropertyTypeOptions.Lazy)
    public address: Address;

    @ra_property(Date)
    public date: Date;
}