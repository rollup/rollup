let sideEffects = 0;

function destructured({}) {
	sideEffects++;
}

destructured({});

assert.strictEqual(sideEffects, 1);
