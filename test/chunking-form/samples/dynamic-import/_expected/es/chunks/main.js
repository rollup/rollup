const sharedValue = 'shared';

assert.equal(sharedValue, 'shared');

const promise = import('./other.js').then(result =>
	assert.deepEqual(result, { value: 'shared' })
);

export { promise as p, sharedValue as s };
