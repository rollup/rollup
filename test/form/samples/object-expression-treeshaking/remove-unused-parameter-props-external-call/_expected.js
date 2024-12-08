function test(obj) {
	externalFunc(obj.a);
}

test({
	a: { b: 1, c: 2 }});
