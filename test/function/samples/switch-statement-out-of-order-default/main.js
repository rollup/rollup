function getSelectedValue(selector) {
	switch (selector) {
		default:
		case 'bar':
			return 'bar';
		case 'foo':
	}
	return selector;
}

assert.strictEqual(getSelectedValue('foo'), 'foo');
