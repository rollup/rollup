const obj = { mutated: false, noEffect() {} };

function updateObj(target) {
	target.mutated = true;
}

updateObj(obj);

console.log(obj.mutated ? 'OK' : 'FAIL');
