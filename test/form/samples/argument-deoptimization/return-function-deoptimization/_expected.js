const obj = { mutated: false};

function foo() {
	return x => {
		x.mutated = true;
	};
}

foo()(obj);

console.log(obj.mutated ? 'OK' : 'FAIL');
