function foo() {
	return 'dep2';
}

Promise.resolve().then(function () { return dep1; }).then(({ bar }) => console.log(bar()));

function bar() {
	return foo();
}

var dep1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
	bar: bar
}, null));

console.log(foo(), bar());
