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

function foo(bar) {
	bar();
}

console.log(add1(1, 2));
console.log(add2(1, 2));
console.log(foo(add3));
