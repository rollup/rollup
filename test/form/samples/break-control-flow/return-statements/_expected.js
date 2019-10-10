function brokenFunction() {
	console.log('retained');
	return;
}

brokenFunction();

const brokenFunctionExpression = function() {
	console.log('retained');
	return;
};

brokenFunctionExpression();

const brokenArrow = () => {
	console.log('retained');
	return;
};

brokenArrow();
console.log('retained');
console.log('retained');
console.log('retained');
