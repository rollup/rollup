function getNullSideEffect() {
	console.log('effect');
	return null;
}

console.log('null');
console.log('undefined');
console.log(0);
console.log('');
console.log('Hello');

console.log('null return');
console.log(getNullSideEffect() ?? 'null return with side-effect');
