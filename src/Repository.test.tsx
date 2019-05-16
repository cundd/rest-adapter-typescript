/* tslint:disable:no-any */

import { AdapterInterface } from './AdapterInterface';
import { ClassConstructorType } from './ClassConstructorType';
import { Converter as ConverterClass } from './Converter';
import { ConverterInterface } from './ConverterInterface';
import { Repository } from './Repository';
import { RestAdapter as RestAdapterClass } from './RestAdapter';
import DoneCallback = jest.DoneCallback;
import MockInstance = jest.MockInstance;

jest.mock('./Converter');
jest.mock('./RestAdapter');
const RestAdapter: MockInstance<RestAdapterClass, any> = (RestAdapterClass as any);
const Converter: MockInstance<ConverterInterface<any>, any> = (ConverterClass as any);

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

    const AdapterMock = jest.fn<AdapterInterface, any>(() => ({
        findAll: jest.fn(() => {
            return Promise.resolve([simple]) as any;
        }),
        findByIdentifier: jest.fn(() => {
            return Promise.resolve(simple) as any;
        }),
    }));

    it('Converter should be invoked for findAll()', (done: DoneCallback) => {
        const ConverterMock = jest.fn<ConverterInterface<any>, any>(() => ({
            // @ts-ignore
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

    it('Converter should be invoked for findByIdentifier()', (done: DoneCallback) => {
        const ConverterMock = jest.fn<ConverterInterface<any>, any>(() => ({
            // @ts-ignore
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
