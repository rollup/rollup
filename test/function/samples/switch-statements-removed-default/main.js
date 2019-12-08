function performSwitch(value) {
	switch (value) {
		case 'foo':
			return false;
		default:
	}
	return true;
}

assert.ok(performSwitch('baz'));
