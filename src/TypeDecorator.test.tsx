import { Address } from './Tests/Fixtures/Address';
import { Person } from './Tests/Fixtures/Person';

describe('Fetch type information', () => {
    it('from Address', () => {
        const address = new Address();

        expect(Reflect.getMetadata('design:type', address, '_person')).toEqual(Person);
        expect(Reflect.getMetadata('design:type', Address.prototype, '_person')).toEqual(Person);
    });
});
