const sharedValue = 'shared';

assert.equal(sharedValue, 'shared');

const promise = import('./other.js').then(result =>
	assert.deepEqual(result, { value: 'shared', extra: 'extra' })
);

export { promise as p, sharedValue as s };
