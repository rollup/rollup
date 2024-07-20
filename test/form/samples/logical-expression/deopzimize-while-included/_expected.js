let isFirstReassigned = false;

const result1 = (foo(), isFirstReassigned);
console.log(result1);

let isSecondReassigned = false;

(foo(), reassign2() || foo());
console.log(result1);

function reassign2() {
	// this needs to be included
	isSecondReassigned = true;
	return isSecondReassigned;
}
