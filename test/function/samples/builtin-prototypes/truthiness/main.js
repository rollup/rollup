if (!{}.hasOwnProperty) {
	throw new Error('Prototype method evaluated as falsy');
}

assert.strictEqual({}.hasOwnProperty ? true : false, true);
