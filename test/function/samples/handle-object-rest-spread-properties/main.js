const a = {
	result: true
};

const b = {
	...a
};

if (!b.result) {
	throw new Error('Spread properties were not recognized');
}
