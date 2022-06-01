let effect = false;

class TestSuper {
	constructor() {
	}

	static bar() {}
}

class Test extends TestSuper {
	constructor() {
		super();
	}

	static foo() {}
}

const setEffect = {
	get() {
		effect = true;
	},
};

const addGetters = obj => {
	Object.defineProperty(obj, 'x', setEffect);
	Object.defineProperty(obj.foo, 'x', setEffect);
	Object.defineProperty(obj.bar, 'x', setEffect);
};

const checkEffect = () => {
	assert.ok(effect);
	effect = false;
};

addGetters(Test);

Test.x;
checkEffect();

Test.foo.x;
checkEffect();

TestSuper.bar.x;
checkEffect();
