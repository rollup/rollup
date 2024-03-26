function foo1() {
	return 1;
}

function bar1(foo) {
	console.log(foo())
}

// pure
function foo2() {
	return 1;
}

function bar2(foo) {
	foo()
}

// not pure
function foo3() {
	console.log(1);
}

function bar3(foo) {
	foo()
}


console.log(bar1(foo1), bar2(foo2), bar3(foo3))
