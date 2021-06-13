import './dep.js';

console.log('main');

({
	get foo() {
		console.log('effect');
	}
}.foo);

try {
	const noeffect = 1;
} catch {}

unknownGlobal;

if (!foo) console.log('effect');
var foo = true;
