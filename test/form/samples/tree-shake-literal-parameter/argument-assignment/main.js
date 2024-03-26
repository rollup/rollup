function add(a, b) {
	let sum = 0;
	for (let i = a; i < b; i++) {
		sum += i;
	}
	return sum;
}

function foo(a) {
	// don't optimize to '0;'
	a = 0;
	console.log(a)
}

console.log(foo(add(0, 100)))
