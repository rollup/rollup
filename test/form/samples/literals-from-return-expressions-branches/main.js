/*
A bunch of cases in this file are actually broken.
See https://github.com/rollup/rollup/issues/5063 and https://github.com/rollup/rollup/pull/6065
*/

// Known broken: DCE gets rid of the `return false`, but too late for it to be considered during constant folding (#5063)
function returnTrueWithDeadBranch() {
	if (false) return false;
	return true;
}

// Known broken: DCE gets rid of the `return false`, but too late for it to be considered during constant folding (#5063)
function returnFalseWithDeadBranch() {
	if (true) return false;
	return true;
}

// Known broken: DCE gets rid of the `return false`, but too late for it to be considered during constant folding (#5063)
// Also broken because the last statement isn't a return, so a virtual `return undefined` is added (which makes the result unknown)
function returnTrueWithDeadBranchAlt() {
	if (false) return false;
	else return true;
}

// Known broken: DCE gets rid of the `return false`, but too late for it to be considered during constant folding (#5063)
// Also working by accident because the last statement isn't a return, so a virtual `return undefined` is added (which is still falsy)
function returnFalseWithDeadBranchAlt() {
	if (true) return false;
	else return true;
}

// Known broken: DCE gets rid of the `return false`, but too late for it to be considered during constant folding (#5063)
function returnTrueWithBrokenFlow() {
	return true;
	return false;
}

// Works by accident: the final virtual return is `undefined`, which is falsy (#5063)
function returnFalseOnAllBranches() {
	switch (Math.random() * 1000) { // * 1k because advanced type analysis would flag all branches except default as dead ;)
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

// Not implemented yet; needs both dead switch branch detection and #5063
function returnFalseOnAllReachableBranches() {
	switch (Math.random() * 1000) { // * 1k because advanced type analysis would flag all branches except default as dead ;)
		case 1: return false;
		case 2: return false;
		case 3: return false;
		case 5: return false;
		case 8: return false;
		case 1: return true; // This branch can trivially eliminated: duplicate cases are unreachable except via fallthrough
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

function returnTruthyTrue() {
	if (Math.random() > 0.5) return returnMixedTruthy();
	return true;
}

function returnTruthyFalse() {
	if (Math.random() > 0.5) return returnMixedTruthy();
	return false;
}

function returnTruthyTruthy() {
	if (Math.random() > 0.5) return returnMixedTruthy();
	return returnMixedTruthy();
}

function returnTruthyFalsy() {
	if (Math.random() > 0.5) return returnMixedTruthy();
	return returnMixedFalsy();
}

function returnFalsyTrue() {
	if (Math.random() > 0.5) return returnMixedFalsy();
	return true;
}

function returnFalsyFalse() {
	if (Math.random() > 0.5) return returnMixedFalsy();
	return false;
}

function returnFalsyTruthy() {
	if (Math.random() > 0.5) return returnMixedFalsy();
	return returnMixedTruthy();
}

function returnFalsyFalsy() {
	if (Math.random() > 0.5) return returnMixedFalsy();
	return returnMixedFalsy();
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

if (returnTruthyTrue()) {
	console.log('retained -- returnTruthyTrue');
}

if (returnTruthyFalse()) {
	console.log('retained + cond -- returnTruthyFalse');
}

if (returnTruthyTruthy()) {
	console.log('retained -- returnTruthyTruthy');
}

if (returnTruthyFalsy()) {
	console.log('retained + cond -- returnTruthyFalsy');
}

if (returnFalsyTrue()) {
	console.log('retained + cond -- returnFalsyTrue');
}

if (returnFalsyFalse()) {
	console.log('removed -- returnFalsyFalse');
}

if (returnFalsyTruthy()) {
	console.log('retained + cond -- returnFalsyTruthy');
}

if (returnFalsyFalsy()) {
	console.log('removed -- returnFalsyFalsy');
}
