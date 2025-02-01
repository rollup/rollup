function test1(obj) {
	return [obj.a, obj.d.e];
}

console.log(
	test1({
		a: { b: 1, c: 2 },
		d: { e: 4, f: 5 }})
);

function test2(obj) {
	console.log(obj.a);
	console.log(obj.d.e);
}

test2({
	a: { b: 1, c: 2 },
	d: { e: 4, f: 5 }});
