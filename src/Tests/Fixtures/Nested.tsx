// tslint:disable:max-classes-per-file

import { ra_property } from '../../TypeDecorator/PropertyLevel';

export class A {
    @ra_property()
    public name: string;
}

export class B extends A {
    @ra_property('description')
    private _description: string;

    get description(): string {
        return this._description;
    }
}

export class C {
    @ra_property('b')
    private _b: B;

    @ra_property('description')
    private _description: string;

    get b(): B {
        return this._b;
    }

    get description(): string {
        return this._description;
    }

    get computed(): string {
        return 'Computed ' + this.b.name;
    }
}

export class Inner {
    @ra_property()
    public a?: A;

    @ra_property()
    public b: B;

    get c(): C | undefined {
        return this._c;
    }

    @ra_property(C, 'c')
    private _c?: C;
}

export class Nested {
    @ra_property()
    public inner: Inner;
}

export interface NestedInterface {
    inner: Inner;
}

export class NestedWithInterface implements NestedInterface {
    get inner(): Inner {
        return this._inner;
    }

    @ra_property('inner')
    protected _inner: Inner;
}

export class NestedWithParentAndInterface extends NestedWithInterface {
    get inner(): Inner {
        return this._inner2 as Inner;
    }

    @ra_property('inner')
    private _inner2?: Inner;
}
