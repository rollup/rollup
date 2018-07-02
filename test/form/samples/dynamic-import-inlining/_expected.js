const foo = 1;

var foo$1 = /*#__PURE__*/Object.freeze({
	foo: foo
});

const bar = 2;
Promise.resolve().then(function () { return foo$1; });

export { bar };
