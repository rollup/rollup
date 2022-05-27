class TestSuper {
	constructor(a = 'retained') {
		console.log(a);
	}

	static staticMethod(a = 'retained') {
		console.log(a);
	}

	static staticProp = (a = 'retained') => console.log(a);
}

class Test extends TestSuper {}

new Test().method();
Test.staticMethod();
Test.staticProp();
