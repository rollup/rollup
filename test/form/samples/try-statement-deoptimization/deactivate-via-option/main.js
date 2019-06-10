function callGlobal() {
	Object.create(null);
}

function mutate(foo) {
	foo.bar = 1;
}

export const mutated = {};

function test(callback) {
	try {
		Object.create(null);
		callback();
		callGlobal();
		mutate(mutated);
	} catch {}
}

test(() => {
	Object.create(null);
});
