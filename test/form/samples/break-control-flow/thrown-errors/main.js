function brokenFunction() {
	console.log('start');
	throw new Error();
	console.log('removed');
	throw new Error('removed');
}

try {
	brokenFunction();
} catch {}

const brokenFunctionExpression = function() {
	console.log('start');
	throw new Error();
	console.log('removed');
	throw new Error('removed');
};

try {
	brokenFunctionExpression();
} catch {}

const brokenArrow = () => {
	console.log('start');
	throw new Error();
	console.log('removed');
	throw new Error('removed');
};

try {
	brokenArrow();
} catch {}

function brokenFunction2() {
	console.log('start');
	throw new Error();
	console.log('removed');
	throw new Error('removed');
}

try {
	brokenFunction2();
} catch {}

throw new Error();
console.log('removed');
throw new Error('removed');
