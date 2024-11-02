const report_values = { reason: '' };
const switchSubmit = state => {
	if (state == 1) {
		assert.ok(true);
	} else if (state == 0) {
		assert.ok(false);
	}
};

const valuesProxy = new Proxy(report_values, {
	set(target, property, value) {
		target[property] = value;
		if (report_values.reason !== '') {
			switchSubmit(1);
		} else {
			switchSubmit(0);
		}
        return true;
	}
});

valuesProxy.reason = 'foo';
