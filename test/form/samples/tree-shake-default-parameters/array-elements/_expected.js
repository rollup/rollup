var isUndefined;

const test2 = [
	(a = 'retained') => console.log(a)
];

const test = [
	(a = 'retained', b = 'retained', c, d) => console.log(a, b, c),
	...test2,
	(a = 'retained') => console.log(a)
];

test[0](isUndefined, 'b', 'c');
test[0]('a', globalThis.unknown, 'c');
test[1]();
test[2]();
