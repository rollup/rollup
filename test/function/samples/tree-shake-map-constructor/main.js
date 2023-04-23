assert.ok(
	new Map({
		[Symbol.iterator]() {
			return {
				next() {
					console.log('side effect');
					return { done: true };
				}
			};
		}
	})
);
