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

function brokenFunctionRemoved() {
	return;
	console.log('removed');
}

brokenFunctionRemoved();
console.log('retained');

const brokenFunctionExpressionRemoved = function() {
	return;
	console.log('removed');
};

brokenFunctionExpressionRemoved();
console.log('retained');

const brokenArrowRemoved = () => {
	return;
	console.log('removed');
};

brokenArrowRemoved();
console.log('retained');
