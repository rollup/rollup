function brokenFunction() {
	console.log('start');
	throw new Error();
}

try {
	brokenFunction();
} catch {}

const brokenFunctionExpression = function() {
	console.log('start');
	throw new Error();
};

try {
	brokenFunctionExpression();
} catch {}

const brokenArrow = () => {
	console.log('start');
	throw new Error();
};

try {
	brokenArrow();
} catch {}

function brokenFunction2() {
	console.log('start');
	throw new Error();
}

try {
	brokenFunction2();
} catch {}

throw new Error();
