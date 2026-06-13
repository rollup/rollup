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

function returnFalsyTruthy() {
	if (Math.random() > 0.5) return returnMixedFalsy();
	return returnMixedTruthy();
}

{
	console.log('retained -- returnTrueWithDeadBranch');
}

{
	console.log('retained -- returnTrueWithDeadBranchAlt');
}

{
	console.log('retained -- returnTrueWithBrokenFlow');
}

{
	console.log('retained -- returnMixedTruthy');
}

{
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

if (returnFalsyTruthy()) {
	console.log('retained + cond -- returnFalsyTruthy');
}
