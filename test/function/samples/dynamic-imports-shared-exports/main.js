import { shared } from './shared.js';

assert.ok(shared);
export const promise = import('./dynamic1.js').then(({ promise, ...ns }) => {
	assert.deepStrictEqual(ns, { shared: true });
	return ns.promise;
});
