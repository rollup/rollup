function getNull() {
	return null;
}

function getNullSideEffect() {
	console.log('effect');
	return null;
}

console.log(null ?? 'null');
console.log(undefined ?? 'undefined');
console.log(0 ?? 'unused');
console.log('' ?? 'unused');
console.log('Hello' ?? 'unused');

console.log(getNull() ?? 'null return');
console.log(getNullSideEffect() ?? 'null return with side-effect');
