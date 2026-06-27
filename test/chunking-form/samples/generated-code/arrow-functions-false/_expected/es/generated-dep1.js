const foo = 'dep2';
Promise.resolve().then(function () { return dep1; }).then(console.log);

const bar = 'dep1' + foo;

var dep1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
	bar: bar
}, null));

export { bar as b, dep1 as d, foo as f };
