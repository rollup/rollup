const obj = { mutated: false};

function updateObj(target) {
	target.mutated = true;
}

updateObj(obj);

console.log(obj.mutated ? 'OK' : 'FAIL');
