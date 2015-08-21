var foo;

foo = (function () {
	return function foo () {
		return 42;
	};
})();

export { foo };
