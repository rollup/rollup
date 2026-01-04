import * as a from './dep.js';
import { value2 } from './dep2.js';

const b = a;

export function test(keys) {
	for (const key of keys) {
		b[key].mutated = true;
	}
	if (!a.value.mutated) {
		throw new Error('Mutation 1 not reflected');
	}
	if (!value2.mutated) {
		throw new Error('Mutation 2 not reflected');
	}
}
