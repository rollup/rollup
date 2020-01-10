if (globalThis.unknown) {
	import('./inlined.js').then(console.log);
}

console.log('main1');
