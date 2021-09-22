const foo = 'dep2';
Promise.resolve().then(function () { return dep1; }).then(console.log);

const bar = 'dep1' + foo;

var dep1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	bar: bar
});

export { bar as b, dep1 as d, foo as f };
