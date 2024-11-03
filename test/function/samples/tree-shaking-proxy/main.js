const report_values = { reason: '' };
const switchSubmit = state => {
	assert.ok(state === 1);
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

{
	const report_values = { reason: '' };
	const switchSubmit = state => {
		assert.ok(state === 1);
	};

	const d = {
		set(target, property, value) {
			target[property] = value;
			if (report_values.reason !== '') {
				switchSubmit(1);
			} else {
				switchSubmit(0);
			}
			return true;
		}
	};

	const valuesProxy = new Proxy(report_values, d);

	valuesProxy.reason = 'foo';
}
