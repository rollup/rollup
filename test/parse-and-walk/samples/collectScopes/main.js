import imported, { named as renamed } from 'external';

const top = renamed;

function outer(param = top) {
	{
		const block = param;
		function blockFunction() {}
		var hoisted;
		globalValue;
	}
	try {
		throw 1;
	} catch (error) {
		var error;
		globalInCatch;
	}
	for (let index = 0; index < 1; index++) {
		let loopBody = index;
	}
	return function inner(namedParameter) {
		return imported + top + hoisted + block + blockFunction + namedParameter;
	};
}

class Declaration {
	static {
		let staticBlockLocal;
		staticBlockLocal;
	}
}

const expression = class NamedExpression {
	method() {
		return NamedExpression;
	}
};
// `NamedExpression` is only visible inside its own class scope, not here.
NamedExpression;

// A named function expression's name is only visible inside the function body.
const fnExpression = function namedFn() {
	return namedFn;
};
namedFn;

// `var` declared in a nested function is hoisted to the enclosing function and
// visible from a sibling nested function declared earlier.
function hoistingHost() {
	function readsHoisted() {
		return hoistedVar;
	}
	var hoistedVar;
	return readsHoisted;
}

// `var` inside a for-loop body is hoisted past the loop's BlockScope to the
// enclosing function scope and is visible after the loop.
function loopHoistingHost() {
	for (let i = 0; i < 1; i++) {
		var loopVar;
	}
	return loopVar;
}

// Destructuring records only binding identifiers, not object keys.
const { key: binding, untouched, ...rest } = source;
key;
binding;
untouched;
rest;
source;

// A destructuring assignment (not a declaration) does not record bindings.
({ assigned } = source);
assigned;

// The switch discriminant is evaluated in the surrounding scope, not the
// switch's own block scope.
const discriminant = 1;
switch (discriminant) {
	default:
		const caseLocal = 2;
		caseLocal;
}

export { Declaration, expression, fnExpression, hoistingHost, outer };
