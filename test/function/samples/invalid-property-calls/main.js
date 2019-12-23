function assertThrows(callback, description) {
	let thrown = false;
	try {
		callback();
	} catch (err) {
		thrown = true;
	}
	assert.ok(thrown, description);
}

assertThrows(() => {
	const obj = { first: () => {} };
	obj[globalOther]();
}, 'unknown missing property');

assertThrows(() => {
	const obj = { first: () => {} };
	delete obj[globalFirst];
	obj.first();
}, 'known property that might be missing');

assertThrows(() => {
	const obj = { first: () => {} };
	delete obj.first;
	obj.first.second();
}, 'known property that is missing');

assertThrows(() => {
	const obj = { set first(value) {} };
	obj.first.second();
}, 'property without getter');

assertThrows(() => {
	const obj = {};
	obj.hasOwnProperty.second('first');
}, 'sub-property of object method');

assertThrows(() => {
	const obj = {};
	obj.first();
}, 'missing property');
