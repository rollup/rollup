import { s as sharedValue } from './chunks/shared.js';

assert.equal(sharedValue, 'shared');

const promise = import('./chunks/other.js').then(result =>
	assert.deepEqual(result, { value: 'shared' })
);

export { promise };
