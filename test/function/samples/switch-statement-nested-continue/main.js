function getValueContinue() {
	for (var i = 0; i < 4; i++) {
		switch (i) {
			case 0:
			case 1:
				continue;
		}
		return i;
	}
}

assert.strictEqual(getValueContinue(), 2);

function getValueBreak() {
	for (var i = 0; i < 4; i++) {
		switch (i) {
			case 0:
			case 1:
				break;
		}
		return i;
	}
}

assert.strictEqual(getValueBreak(), 0);
