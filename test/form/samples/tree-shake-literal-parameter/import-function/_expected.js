// export default
function add(a, b, enable) {
	{
		return a + b;
	}
}

function add1(a, b, enable) {
	{
		return a + b;
	}
}

function add2(a, b, enable) {
	return a - b;
}

// keep it
function add3(a, b, enable) {
	if (enable) {
		return a + b;
	}
	return a - b;
}

// conditional expression
function add4(a, b, enable) {
	{
		return a + b;
	}
}

function foo(bar) {
	console.log(bar());
}

console.log(add(1, 2));
console.log(add1(1, 2));
console.log(add2(1, 2)); // unused should be treated as undefined
console.log(foo(add3));
console.log(add4(1, 2));
