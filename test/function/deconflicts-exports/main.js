var exports = {
	number: 21
};

export var a = 'A';
export var b = exports.number * 2;

assert.deepEqual( Object.keys( exports ), [ 'number' ]);
