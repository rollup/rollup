function withEffects() {
	console.log('effect');
}

if (globalThis.unknown > 0) {
	console.log('effect');
	withEffects();
}
