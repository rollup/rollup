let effects = 0;

const objWithEffect = {
	get foo() {
		effects++;
		return 'foo';
	}
};

Object.values(objWithEffect);
Object.entries(objWithEffect);

assert.equal(effects, 2);
