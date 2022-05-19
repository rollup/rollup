import { sharedDynamic } from './sharedDynamic.js';

assert.ok(sharedDynamic);
export const promise = import('./dynamic2.js').then(ns =>
	assert.deepStrictEqual(ns, { sharedDynamic: true })
);

export { shared } from './shared.js';
