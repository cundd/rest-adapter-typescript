import { PropertyTypeOptions, ra_property } from '../../TypeDecorator';
import { Address } from './Address';

export class AddressBook {
    @ra_property(Address, PropertyTypeOptions.Multiple)
    public contacts: Address[];
}
