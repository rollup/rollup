import {noEffects, withEffects} from './foo.js';

if (globalThis.unknown > 0) {
	noEffects();
}

if (globalThis.unknown > 0) {
	console.log('effect');
	noEffects();
	withEffects();
}
