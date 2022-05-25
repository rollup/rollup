function test(a = 'removed') {
	console.log(a);
}

test({});
test([]);
test(() => {});
test(function () {});
function a(){}
test(a);
test(Symbol);
