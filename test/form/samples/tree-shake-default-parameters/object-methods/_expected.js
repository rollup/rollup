var isUndefined;

const test = {
	method(a = 'retained', b = 'retained', c, d = 'retained') {
		console.log(a, b, c);
	}
};

test.method(isUndefined, 'b', 'c');
test.method('a', globalThis.unknown, 'c');
