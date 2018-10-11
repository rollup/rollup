function getData() {
	var data = [];

	'abc'.trim().replace('b', function() {
		data.push('replaced');
	});

	return data;
}

assert.deepEqual(getData(), ['replaced']);
