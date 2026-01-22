import { obj } from './dep.js';

export const test = async () => {
	const n = await import('./dep.js');
	n.obj.mutated = true;
	assert.ok(obj.mutated ? true : false);
};
