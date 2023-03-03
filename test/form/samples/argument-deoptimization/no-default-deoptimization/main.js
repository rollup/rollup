const obj = { mutated: false, noEffect() {} };

function updateObj(target) {
	target.mutated = true;
}

updateObj(obj);

// removed
obj.noEffect();

console.log(obj.mutated ? 'OK' : 'FAIL');
