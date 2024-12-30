function mutate(a) {
	arguments[0].x = true;
	arguments[1].x = true;
}

var obj1 = {
	x: false
};

var obj2 = {
	x: false
};

mutate(obj1, obj2);

assert.ok(obj1.x ? true : false, 'obj1');
assert.ok(obj2.x ? true : false, 'obj2');
