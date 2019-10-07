function brokenFunction() {
	console.log('retained');
	return;
	console.log('removed');
}

brokenFunction();

const brokenFunctionExpression = function() {
	console.log('retained');
	return;
	console.log('removed');
};

brokenFunctionExpression();

const brokenArrow = () => {
	console.log('retained');
	return;
	console.log('removed');
};

brokenArrow();
