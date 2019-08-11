var obj = {
	x: false
};

var p = {
	*[Symbol.iterator]() {
		yield obj;
	}
};

[...p][0].x = true;

if (!obj.x) {
	throw new Error('x was not reassigned');
}
