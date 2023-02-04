let effect = false;

function getPatternValueWithEffect() {
	effect = true;
	return 'value';
}

function test({ [getPatternValueWithEffect()]: value }) {}

test({ value: 'foo' });

assert.ok(effect);
