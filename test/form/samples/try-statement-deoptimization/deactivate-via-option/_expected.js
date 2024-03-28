function mutate(foo) {
	foo.bar = 1;
}

const mutated = {};

function test(callback) {
	try {
		mutate(mutated);
	} catch {}
}

test();

try {} finally {
	console.log('retained');
}

export { mutated };
