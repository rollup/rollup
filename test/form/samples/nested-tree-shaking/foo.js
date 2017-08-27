export function noEffects() {
	const foo = () => {};
	foo();
}

export function withEffects() {
	noEffects();
	console.log('effect');
}
