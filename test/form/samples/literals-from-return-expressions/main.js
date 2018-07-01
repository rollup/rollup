const foo = true,
	bar = false;

function returnTrue() {
	return foo;
}

function returnFalse() {
	return bar;
}

function returnTrueWithEffect() {
	console.log('effect');
	return true;
}

function returnFalseWithEffect() {
	console.log('effect');
	return false;
}

if (returnTrue()) {
	console.log('retained');
}

if (returnFalse()) {
	console.log('removed');
}

if (returnTrueWithEffect()) {
	console.log('retained');
}

if (returnFalseWithEffect()) {
	console.log('removed');
}
