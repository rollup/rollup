function withEffects() {
	console.log('effect');
}

if (globalVar > 0) {
	console.log('effect');
	withEffects();
}
