import { preload } from './preload.js';
import { load } from './loader.js';
console.log(
	preload(() => 'entry'),
	typeof load
);
