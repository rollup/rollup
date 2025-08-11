function returnTrueWithDeadBranch() {
	if (false) return false;
	return true;
}

function returnFalseWithDeadBranch() {
	if (true) return false;
	return true;
}

function returnTrueWithDeadBranchAlt() {
	if (false) return false;
	else return true;
}

function returnFalseWithDeadBranchAlt() {
	if (true) return false;
	else return true;
}

function returnTrueWithBrokenFlow() {
	return true;
	return false;
}

function returnFalseOnAllBranches() {
	switch (Math.random()) {
		case 1: return false;
		case 1: return false;
		case 2: return false;
		case 3: return false;
		case 5: return false;
		case 8: return false;
		case 13: return false;
		case 21: return false;
		case 34: return false;
		case 55: return false;
		case 89: return false;
		case 144: return false;
		default: return false;
	}
}

function returnMixedTruthy() {
	switch (Math.random()) {
		case 1: return 'wow!';
		case 2: return true;
		// Known broken; c.f. ObjectEntity -- case 3: return [0];
		// Known broken; c.f. ObjectEntity -- case 4: return {x:1};
		case 5: return 1337;
	}

	return ~0;
}

function returnMixedFalsy() {
	switch (Math.random()) {
		case 1: return '';
		case 2: return false;
		case 3: return null;
		case 4: return undefined;
		case 5: return 0;
		default: return ~-1;
	}

	// Unreachable
	return true;
}

function emptyFunction() {}

function complexCase(arg) {
	if (arg) {
		const x = arg * 4;
		if (x % 2) return false; // Unreachable

		{
			if (arg * arg > 0) return arg; // Reached
		}

		{
			return null; // Unreachable
		}
	} else {
		// Unreachable branch
		console.log('removed')
	}

	// implicit return
}

if (returnTrueWithDeadBranch()) {
	console.log('retained -- returnTrueWithDeadBranch');
}

if (returnFalseWithDeadBranch()) {
	console.log('removed -- returnFalseWithDeadBranch');
}

if (returnTrueWithDeadBranchAlt()) {
	console.log('retained -- returnTrueWithDeadBranchAlt');
}

if (returnFalseWithDeadBranchAlt()) {
	console.log('removed -- returnFalseWithDeadBranchAlt');
}

if (returnTrueWithBrokenFlow()) {
	console.log('retained -- returnTrueWithBrokenFlow')
}

if (returnFalseOnAllBranches()) {
	console.log('removed -- returnFalseOnAllBranches');
}

if (returnMixedTruthy()) {
	console.log('retained -- returnMixedTruthy');
}

if (returnMixedFalsy()) {
	console.log('removed -- returnMixedFalsy');
}

if (emptyFunction()) {
	console.log('removed -- emptyFunction');
}

if (complexCase(1)) {
	console.log('retained -- complexCase(1)');
}
