function foo() {
	return 'dep2';
}

Promise.resolve().then(function () { return dep1; }).then(({ bar }) => console.log(bar()));

function bar() {
	return foo();
}

var dep1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	bar: bar
});

export { bar as b, dep1 as d, foo as f };
