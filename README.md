# TypeScript Adapter for [Cundd Rest](https://rest.cundd.net)

```typescript
import AdapterConfiguration from './AdapterConfiguration';
import RestAdapter from './RestAdapter';
const rd = new RestAdapter(AdapterConfiguration.fromUrl('http://base.url.tld/rest/'));

const p = rd.findAll<Nominee>('Iresults-Voting-Nominee');
```