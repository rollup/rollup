var obj = {
	x: false
};

var p = {
	[Symbol.iterator]() {
		var first = true;
		return {
			next() {
				return first
					? {
							done: (first = false),
							value: obj
					  }
					: { done: true, value: null };
			}
		};
	}
};

[...p][0].x = true;

if (!obj.x) {
	throw new Error('x was not reassigned');
}
