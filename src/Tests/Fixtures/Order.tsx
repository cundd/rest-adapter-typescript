import { Type, TypeOptions } from '../../TypeDecorator';
import { Address } from './Address';

export class Order {
    @Type(Address, TypeOptions.Lazy)
    address: Address;

    @Type(Date)
    date: Date;
}