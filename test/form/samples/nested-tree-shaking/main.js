import {noEffects, withEffects} from './foo.js';

if (globalVar > 0) {
	noEffects();
}

if (globalVar > 0) {
	console.log('effect');
	noEffects();
	withEffects();
}
