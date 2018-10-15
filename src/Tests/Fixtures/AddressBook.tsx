import { Type, TypeOptions } from '../../TypeDecorator';
import { Address } from './Address';

export class AddressBook {
    @Type(Address, TypeOptions.Multiple)
    contacts: Address[];
}
