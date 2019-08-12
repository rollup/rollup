function mutate(foo) {
	foo.bar = 1;
}

const mutated = {};

function test(callback) {
	try {
		callback();
		mutate(mutated);
	} catch {}
}

test(() => {
});

export { mutated };
