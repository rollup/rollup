(function () {
	const foo = 'foo';
	if (typeof define === 'function' && define.amd) {
		define([], function () {
			return foo;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = foo;
	} else {
		this.foo = foo;
	}
})();
