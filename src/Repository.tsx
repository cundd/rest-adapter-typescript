import { AdapterInterface } from './AdapterInterface';
import { ClassConstructorType } from './ClassConstructorType';
import { Converter } from './Converter';
import { ConverterInterface } from './ConverterInterface';
import { ExecuteMethod } from './ExecuteMethod';
import { IdentifierInterface } from './IdentifierInterface';
import { RepositoryExecuteInterface } from './RepositoryExecuteInterface';
import { RepositoryInterface } from './RepositoryInterface';
import { RestAdapter } from './RestAdapter';

export class Repository<T> implements RepositoryInterface<T>, RepositoryExecuteInterface<T> {
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
            .then(result => this._converter.convertSingle(this._targetType, result as object | null));
    }

    /**
     * Perform a GET or POST request to the given API path
     *
     * @param {string} subPath
     * @param {ExecuteMethod} method
     * @param {I} body
     * @return {Promise<T[] | Map<string, T> | T | null>}
     */
    public execute<I, R = T[] | Map<string, T> | T | null>(
        subPath: string,
        method: ExecuteMethod = ExecuteMethod.GET,
        body?: I
    ): Promise<R> {
        if (!(this._adapter instanceof RestAdapter)) {
            throw new TypeError('Not implemented');
        }
        const onFulfilled = (result: any) => {
            if (Array.isArray(result)) {
                return this._converter.convertCollection(this._targetType, result);
            } else {
                return this._converter.convertSingle(this._targetType, result);
            }
        };

        const requestPath = this._resourceType + '/' + subPath;

        if (method === 'GET') {
            return this._adapter
                .execute(requestPath)
                .then(onFulfilled) as Promise<R>;
        } else if (method === 'POST') {
            if (arguments.length < 3) {
                throw new ReferenceError('Missing request body');
            }

            return this._adapter
                .execute(requestPath, method, body)
                .then(onFulfilled) as Promise<R>;
        } else {
            throw new TypeError(`Method '${method}' is not implemented`);
        }
    }

    public toString = (): string => {
        return `[Repository<${this._targetType.name}> ${this._resourceType}]`;
    };
}
