import {RepositoryInterface} from './RepositoryInterface';
import {AdapterInterface} from './AdapterInterface';
import {IdentifierInterface} from './IdentifierInterface';
import {ClassConstructorType} from './ClassConstructorType';
import {Converter} from './Converter';

export class Repository<T> implements RepositoryInterface<T> {
    private readonly _adapter: AdapterInterface;
    private readonly _targetType: ClassConstructorType<T>;
    private readonly _resourceType: string;
    private readonly _converter: Converter<T>;

    constructor(targetType: ClassConstructorType<T>, resourceType: string, adapter: AdapterInterface) {
        this._targetType = targetType;
        this._converter = new Converter();
        this._adapter = adapter;
        this._resourceType = resourceType;
    }

    findAll(): Promise<T[]> {
        return this._adapter.findAll(this._resourceType)
            .then(result => this._converter.convertCollection(this._targetType, result));
    }

    findByIdentifier(identifier: IdentifierInterface): Promise<T | null> {
        return this._adapter.findByIdentifier(this._resourceType, identifier)
            .then(result => this._converter.convertSingle(this._targetType, result));
    }
}
