// export default
function add (a, b, enable) {
	{
		return a + b;
	}
}

function add1(a, b, enable) {
	return a - b;
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

// export default
var arrowAdd = (a, b, enable) => {
	{
		return a + b;
	}
};

const arrowAdd1 = (a, b, enable) => {
	return a - b;
};

// keep it
const arrowAdd2 = (a, b, enable) => {
	if (enable) {
		return a + b;
	}
	return a - b;
};

// conditional expression
const arrowAdd3 = (a, b, enable) => {
	{
		return a + b;
	}
};

function foo(bar) {
	console.log(bar());
}

console.log(add(1, 2));
console.log(add1(1, 2));
console.log(add2(1, 2)); // unused argument should be treated as undefined
console.log(foo(add3));
console.log(add4(1, 2));

console.log(arrowAdd(1, 2));
console.log(arrowAdd1(1, 2));
console.log(foo(arrowAdd2));
console.log(arrowAdd3(1, 2));
