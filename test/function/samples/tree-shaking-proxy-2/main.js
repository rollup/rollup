const report_values = { reason: '' };
const switchSubmit = state => {
	if (state == 1) {
		assert.ok(false);
	} else if (state == 0) {
		assert.ok(true);
	}
};

const valuesProxy = new Proxy(report_values, {
	set() {
		if (report_values.reason !== '') {
			switchSubmit(1);
		} else {
			switchSubmit(0);
		}
        return true;
	}
});

valuesProxy.reason = 'foo';
