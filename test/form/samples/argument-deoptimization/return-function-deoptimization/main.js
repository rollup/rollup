const obj = { mutated: false, noEffect() {} };

function foo() {
	return x => {
		x.mutated = true;
	};
}

foo()(obj);

// removed
obj.noEffect();

console.log(obj.mutated ? 'OK' : 'FAIL');
