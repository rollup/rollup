const list = [{}];

for (const element of list) {
	if (element) {
		element.foo = true;
	}
}

assert.ok(list[0].foo, 'List element was not reassigned');

const obj = {
	x: false
};

for (const key in obj) {
	if (key) {
		obj[key] = true;
	}
}

assert.ok(obj.x, 'Object property was not reassigned');
