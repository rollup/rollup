let effect = false;

new Map({
	[Symbol.iterator]() {
		return {
			next() {
				effect = true;
				return { done: true };
			}
		};
	}
});

assert.ok(effect);
