let effects = 0;

const obj = {
	get foo() {
		effects++;
		return "foo";
	}
};

Object.values(obj);
Object.entries(obj);

assert.equal(effects, 2);
