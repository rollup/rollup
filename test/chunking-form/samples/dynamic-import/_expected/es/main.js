import { a as sharedValue } from './chunks/chunk.js';

assert.equal(sharedValue, 'shared');

const promise = import('./chunks/other.js').then(result =>
	assert.deepEqual(result, { value: 'shared' })
);

export { promise };
