var isUndefined;

class Test {
	constructor(a = 'retained', b = 'retained', c, d) {
		console.log(a, b, c);
	}

	method(a = 'retained') {
		console.log(a);
	}

	prop = (a = 'retained') => console.log(a);

	static staticMethod(a = 'retained', b = 'retained', c, d) {
		console.log(a, b, c);
	}

	static staticProp = (a = 'retained', b = 'retained', c, d) =>
		console.log(a, b, c);
}

new Test(isUndefined, 'b', 'c');
new Test('a', globalThis.unknown, 'c').method();

Test.staticMethod(isUndefined, 'b', 'c');
Test.staticMethod('a', globalThis.unknown, 'c');

Test.staticProp(isUndefined, 'b', 'c');
Test.staticProp('a', globalThis.unknown, 'c');
