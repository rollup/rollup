/*
A bunch of cases in this file are actually broken.
See https://github.com/rollup/rollup/issues/5063 and https://github.com/rollup/rollup/pull/6065
*/

// Known broken: DCE gets rid of the `return false`, but too late for it to be considered during constant folding (#5063)
function returnTrueWithDeadBranch() {
	return true;
}

// Known broken: DCE gets rid of the `return false`, but too late for it to be considered during constant folding (#5063)
function returnFalseWithDeadBranch() {
	return false;
}

// Known broken: DCE gets rid of the `return false`, but too late for it to be considered during constant folding (#5063)
// Also broken because the last statement isn't a return, so a virtual `return undefined` is added (which makes the result unknown)
function returnTrueWithDeadBranchAlt() {
	return true;
}

// Known broken: DCE gets rid of the `return false`, but too late for it to be considered during constant folding (#5063)
// Also working by accident because the last statement isn't a return, so a virtual `return undefined` is added (which is still falsy)
function returnFalseWithDeadBranchAlt() {
	return false;
}

// Known broken: DCE gets rid of the `return false`, but too late for it to be considered during constant folding (#5063)
function returnTrueWithBrokenFlow() {
	return true;
}

function returnMixedTruthy() {
	switch (Math.random()) {
		case 1: return 'wow!';
		case 2: return true;
		// Known broken; c.f. ObjectEntity -- case 3: return [0];
		// Known broken; c.f. ObjectEntity -- case 4: return {x:1};
		case 5: return 1337;
	}

	return -1;
}

function returnMixedFalsy() {
	switch (Math.random()) {
		case 1: return '';
		case 2: return false;
		case 3: return null;
		case 4: return undefined;
		case 5: return 0;
		default: return 0;
	}
}

function returnTruthyFalse() {
	if (Math.random() > 0.5) return returnMixedTruthy();
	return false;
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

function complexCase(arg) {
	{

		{
			return arg; // Reached
		}
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
	console.log('retained -- returnTrueWithBrokenFlow');
}

{
	console.log('retained -- returnMixedTruthy');
}

if (returnMixedFalsy()) {
	console.log('removed -- returnMixedFalsy');
}

if (complexCase(1)) {
	console.log('retained -- complexCase(1)');
}

{
	console.log('retained -- returnTruthyTrue');
}

if (returnTruthyFalse()) {
	console.log('retained + cond -- returnTruthyFalse');
}

{
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
