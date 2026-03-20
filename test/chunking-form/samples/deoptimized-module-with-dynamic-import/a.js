import { fn } from './lazy-loader.js';

const x = fn;

function loadCjs() {
	return import('./cjs.js');
}

export const value = 42;
