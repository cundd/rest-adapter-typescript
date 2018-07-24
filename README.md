# TypeScript Adapter for [Cundd Rest](https://rest.cundd.net)

```typescript

import AdapterConfiguration from './AdapterConfiguration';
import RestAdapter from './RestAdapter';
const rd = new RestAdapter(AdapterConfiguration.fromUrl('http://award.srv08.iresults.hosting/rest/'));

        const p = rd.findAll<Nominee>('Iresults-Voting-Nominee');
```