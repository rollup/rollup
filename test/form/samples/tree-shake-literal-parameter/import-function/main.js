function add1(a, b, enable) {
	if (enable) {
        return a + b;
    }
    return a - b;
}

function add2(a, b, enable) {
	if (enable) {
        return a + b;
    }
    return a - b;
}

console.log(add1(1, 2, true));
console.log(add2(1, 2, false));
