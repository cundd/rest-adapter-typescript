# TypeScript Adapter for [Cundd Rest](https://rest.cundd.net)

Library to fetch and deserialize objects from a REST API

```typescript
import {AdapterConfiguration, RestAdapter, PropertyTypeOptions, ra_property} from '@cundd/rest-adapter';

export class Person {
    // Map property `name` 1:1 when converting 
    @ra_property()
    public name: string;

    // Convert the input data of `realEstates` into an array of `RealEstate` objects 
    @ra_property(RealEstate, PropertyTypeOptions.Multiple)
    public realEstates: RealEstate[];
}

export class RealEstate {
    // Use key `street` for property `_street` when converting 
    @ra_property('street')
    private _street: string;

    get street(): string {
        return this._street;
    }
}

const rd = new RestAdapter(AdapterConfiguration.fromUrl('http://base.url.tld/rest/'));
const promise = rd.findAll<Person>('Iresults-RealEstate-Person');
promise
    .then((foundPersons: Person[])=> {
        // Do something with the found records
    })
    .catch(error => {
        // Handle errors
    });
```
