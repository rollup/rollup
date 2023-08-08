let effects = 0;

const objWithEffect = {
	get foo() {
		effects++;
		return 'foo';
	}
};

const objWithoutEffect1 = {
	get foo() {
		return 'foo';
	}
};
const objWithoutEffect2 = {
	foo: 'foo'
};

Object.values(objWithEffect);
Object.entries(objWithEffect);

Object.values(objWithoutEffect1);
Object.entries(objWithoutEffect1);
Object.values(objWithoutEffect2);
Object.entries(objWithoutEffect2);

assert.equal(effects, 2);
