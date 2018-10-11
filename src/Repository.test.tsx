/* tslint:disable:no-any */

import { AdapterInterface } from './AdapterInterface';
import { ClassConstructorType } from './ClassConstructorType';
import { Converter as ConverterClass } from './Converter';
import { ConverterInterface } from './ConverterInterface';
import { Repository } from './Repository';
import { RestAdapter as RestAdapterClass } from './RestAdapter';
import MockInstance = jest.MockInstance;
// jest.mock('./sound-player'); // SoundPlayer is now a mock constructor
jest.mock('./Converter');
jest.mock('./RestAdapter');
const RestAdapter: MockInstance<RestAdapterClass> = (RestAdapterClass as any);
const Converter: MockInstance<ConverterInterface<any>> = (ConverterClass as any);

class Simple {
    public name: string = 'Daniel';
    public age: number = 8;
}

beforeEach(() => {
    RestAdapter.mockClear();
    Converter.mockClear();
});

describe('Converter', () => {
    const simple = new Simple();

    const AdapterMock = jest.fn<AdapterInterface>(() => ({
        findAll: jest.fn(() => {
            return Promise.resolve([simple]);
        }),
        findByIdentifier: jest.fn(() => {
            return Promise.resolve(simple);
        }),
    }));

    it('Converter should be invoked for findAll()', (done: Function) => {
        const ConverterMock = jest.fn<ConverterInterface<any>>(() => ({
            convertCollection: jest.fn((targetType: ClassConstructorType<Simple>, input: Simple[]) => {
                expect(input[0]).toEqual(simple);
                done();
            })
        }));

        const repository = new Repository(
            Simple,
            'resourceType',
            new AdapterMock(),
            new ConverterMock()
        );

        repository.findAll().then();
    });

    it('Converter should be invoked for findByIdentifier()', (done: Function) => {
        const ConverterMock = jest.fn<ConverterInterface<any>>(() => ({
            convertSingle: jest.fn((targetType: ClassConstructorType<Simple>, input: Simple) => {
                expect(input).toEqual(simple);
                done();
            })
        }));

        const repository = new Repository(
            Simple,
            'resourceType',
            new AdapterMock(),
            new ConverterMock()
        );

        repository.findByIdentifier('id').then();
    });
});
