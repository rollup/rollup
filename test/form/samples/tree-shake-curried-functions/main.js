function foo(a) {
	return function(b) {
		return a+b;
	}
}

function bar(a, b) {
	return a+b;
}

foo(1)(2);
bar(1,2);
