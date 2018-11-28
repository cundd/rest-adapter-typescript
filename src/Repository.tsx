import { AdapterInterface } from './AdapterInterface';
import { ClassConstructorType } from './ClassConstructorType';
import { Converter } from './Converter';
import { ConverterInterface } from './ConverterInterface';
import { IdentifierInterface } from './IdentifierInterface';
import { RepositoryInterface } from './RepositoryInterface';
import { RestAdapter } from './RestAdapter';

export class Repository<T> implements RepositoryInterface<T> {
    private readonly _adapter: AdapterInterface;
    private readonly _targetType: ClassConstructorType<T>;
    private readonly _resourceType: string;
    private readonly _converter: ConverterInterface<T>;

    constructor(
        targetType: ClassConstructorType<T>,
        resourceType: string,
        adapter: AdapterInterface,
        converter?: ConverterInterface<T>
    ) {
        if (!targetType) {
            throw new TypeError('Expected argument "targetType" to be a class');
        }
        // noinspection SuspiciousTypeOfGuard
        if (!resourceType || typeof resourceType !== 'string') {
            throw new TypeError('Expected argument "resourceType" to be of type string');
        }
        if (!adapter) {
            throw new TypeError('Expected argument "adapter" to be an instance of AdapterInterface');
        }

        this._targetType = targetType;
        this._converter = converter || new Converter();
        this._adapter = adapter;
        this._resourceType = resourceType;
    }

    public findAll(): Promise<T[] | Map<string, T>> {
        return this._adapter
            .findAll(this._resourceType)
            .then(result => this._converter.convertCollection(this._targetType, result));
    }

    public findByIdentifier(identifier: IdentifierInterface): Promise<T | null> {
        return this._adapter
            .findByIdentifier(this._resourceType, identifier)
            .then(result => this._converter.convertSingle(this._targetType, result));
    }

    /**
     * Fetch the objects at the given resource sub-path
     *
     * @param {string} subPath
     * @return {Promise<T>}
     */
    public execute(subPath: string): Promise<T[] | Map<string, T> | T | null> {
        if (this._adapter instanceof RestAdapter) {
            return this._adapter
                .execute(this._resourceType + '/' + subPath)
                .then(result => {
                    if (Array.isArray(result)) {
                        return this._converter.convertCollection(this._targetType, result);
                    } else {
                        return this._converter.convertSingle(this._targetType, result);
                    }
                });
        }

        throw new TypeError('Not implemented');
    }

    public toString = (): string => {
        return `[Repository<${this._targetType.name}> ${this._resourceType}]`;
    };
}
