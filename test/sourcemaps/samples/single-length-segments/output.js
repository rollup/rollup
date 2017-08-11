var Foo = function () {
	function Foo() {
		babelHelpers.classCallCheck(this, Foo);
	}

	babelHelpers.createClass(Foo, [{
		key: "bar",
		value: function bar() {
			console.log(42);
		}
	}]);
	return Foo;
}();

export { Foo };
