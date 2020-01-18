let isReassigned = false;

const result = (foo(), reassign() ? first() : second());
console.log(result);

function reassign() {
	isReassigned = true;
	return isReassigned;
}
