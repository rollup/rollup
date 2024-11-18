function test1({ a, noEffect, effect }) {
	if (a) console.log('OK');
	else console.log('REMOVED');
	noEffect();
	effect();
}

test1({
	a: true,
	noEffect() {},
	effect() {
		console.log('effect');
	}
});

function test2({ a, noEffect, effect }) {
	if (a) console.log('OK');
	else console.log('REMOVED');
	noEffect();
	effect();
}

const obj2 = {
	a: true,
	noEffect() {},
	effect() {
		console.log('effect');
	}
};

test2(obj2);
test2(obj2);
