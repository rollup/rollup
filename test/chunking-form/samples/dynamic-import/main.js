import { sharedValue } from "./shared";

assert.equal(sharedValue, 'shared');

export const promise = import('./other').then(result =>
	assert.deepEqual(result, { value: 'shared', extra: 'extra' })
);
