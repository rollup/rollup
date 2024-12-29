console.log(true);
console.log(false);
console.log(true);

function foo2() {
	console.log('has side effect');
	return false;
}
console.log(!foo2());

console.log(void 0);
console.log(typeof foo2);
console.log(-Infinity);
console.log(-180n);
console.log(-1000000000);
console.log(Infinity);
console.log(-2);
console.log(false);

function foo3() {
	return false;
}

console.log(delete foo3.a);