function returnTrueWithEffect() {
	console.log('effect');
	return true;
}

function returnFalseWithEffect() {
	console.log('effect');
	return false;
}

{
	console.log('retained');
}

if (returnTrueWithEffect()) {
	console.log('retained');
}

if (returnFalseWithEffect()) ;
