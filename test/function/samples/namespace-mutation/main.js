import * as a from './dep.js';
import { value2 } from './dep2.js';

const b = a;
b.value.mutated = true;

if (!a.value.mutated) {
	throw new Error('Mutation 1 not reflected');
}

b.value2.mutated = true;

if (!value2.mutated) {
	throw new Error('Mutation 2 not reflected');
}
