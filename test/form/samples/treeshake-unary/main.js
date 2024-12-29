function foo() { // removed
	return false;
}

console.log(!foo());
console.log(!!foo());
console.log(!!!foo());

function foo2() {
	console.log('has side effect');
	return false;
}
console.log(!foo2());

console.log(void 0);
console.log(typeof foo2);
console.log(-(1 / 0));
console.log(-180n);
console.log(-1000000000);
console.log(+(1 / 0));
console.log(~1);
console.log(!!!true);

function foo3() {
	return false;
}

console.log(delete foo3.a);
