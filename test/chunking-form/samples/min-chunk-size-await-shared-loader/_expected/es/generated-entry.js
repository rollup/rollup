import { p as preload, l as load } from './generated-loader.js';

console.log(
	preload(() => 'entry'),
	typeof load
);
