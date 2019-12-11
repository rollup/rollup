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
	const obj = { first: { second: 0} };
	obj[globalOther].second = 1;
}, 'sub-property of unknown property');

assertThrows(() => {
	const obj = { first: { second: 0} };
	delete obj.first;
	obj.first.second = 1;
}, 'sub-property of reassigned property');

assertThrows(() => {
	const obj = {};
	obj.first.second = 1;
}, 'sub-property of missing property');

assertThrows(() => {
	const obj4 = { set first(value) {} };
	obj4.first.second = 1;
}, 'sub-property of property without getter');
