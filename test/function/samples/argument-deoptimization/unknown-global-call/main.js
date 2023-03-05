globalThis.fn = arg => {
	arg.mutated = true;
};

const obj = {
	mutated: false
};

fn(obj);

assert.ok(obj.mutated ? true : false);
