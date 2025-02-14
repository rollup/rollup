const options = {
	bar: () => 'bar',
	car: () => 'car'
};

assert.strictEqual(qux(options), 'car');

function qux({ bar, car }) {
	try {
		return car();
	} catch {
		return undefined;
	}
}
