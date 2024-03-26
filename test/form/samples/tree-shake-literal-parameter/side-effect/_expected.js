function foo1() {
	return 1;
}

function bar1(foo) {
	console.log(foo());
}

function bar2(foo) {
}

// not pure
function foo3() {
	console.log(1);
}

function bar3(foo) {
	foo();
}


console.log(bar1(foo1), bar2(), bar3(foo3));
