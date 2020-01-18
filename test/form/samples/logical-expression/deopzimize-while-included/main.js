let isFirstReassigned = false;

const result1 = (foo(), isFirstReassigned && reassign1());
console.log(result1);

function reassign1() {
	// this should never be triggered
	isFirstReassigned = true;
}

let isSecondReassigned = false;

const result2 = (foo(), reassign2() || foo());
console.log(result1);

function reassign2() {
	// this needs to be included
	isSecondReassigned = true;
	return isSecondReassigned;
}
