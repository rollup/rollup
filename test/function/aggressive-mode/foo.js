function Foo () {}

Foo.prototype = {
	answer: function () {
		return 42;
	}
};

export default function foo () {
	return new Foo();
}
