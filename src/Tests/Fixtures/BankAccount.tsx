import { ClassTypeOptions, ra } from '../../TypeDecorator';

@ra(ClassTypeOptions.AddUnknownFields)
export class BankAccount {
    constructor(public firstName: string, public lastName: string, public iban: string) {
    }
}
