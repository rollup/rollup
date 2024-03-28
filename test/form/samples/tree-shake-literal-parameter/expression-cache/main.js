function add1(a, b, enable) {
	if (enable? true: false) {
		return a + b;
	}
	return a - b;
}

function add2(a, b, enable) {
	if (enable && 1) {
		return a + b;
	}
	return a - b;
}

console.log(add1(1, 2, true));
console.log(add2(1, 2, true));