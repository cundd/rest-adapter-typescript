import RestAdapter from "./RestAdapter";
import AdapterConfiguration from "./AdapterConfiguration";

it('findAll should succeed', (done: Function) => {
    const adapter = new RestAdapter(AdapterConfiguration.fromUrl(''));

    const promise = adapter.findAll('blur');
    promise.then((r) => {
        console.log(r);
        done();
    });
    promise.catch((r) => {
        console.log(r);
    });
});
