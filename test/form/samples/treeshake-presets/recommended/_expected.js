console.log('dep');

console.log('main');

({
	get foo() {
		console.log('effect');
	}
}.foo);

try {
	const noeffect = 1;
} catch {}

if (!foo) console.log('effect');
var foo = true;
