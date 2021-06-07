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
