const assert = require('node:assert/strict');

const checks = [];

module.exports = defineTest({
	description: 'provides scope information via parseAndWalk',
	parseOptions: { collectScopes: true },
	walk: {
		Identifier(node, { scope }) {
			checks.push([node.name, node.start, scope.contains(node.name)]);
		}
	},
	assertions() {
		assert.deepEqual(checks, [
			// import locals are declared in the module scope; the imported name
			// ("named") is not a local declaration.
			['imported', 7, true],
			['named', 19, false],
			['renamed', 28, true],
			// top-level declaration
			['top', 62, true],
			['renamed', 68, true],
			// function declaration name binds in the parent (module) scope
			['outer', 87, true],
			// parameter default expression sees the module scope
			['param', 93, true],
			['top', 101, true],
			// block-scoped declarations inside a nested block
			['block', 119, true],
			['param', 127, true],
			['blockFunction', 145, true],
			// var is hoisted to the enclosing function scope
			['hoisted', 170, true],
			// an undeclared name is a global
			['globalValue', 181, false],
			// catch parameter and var with the same name as the parameter
			['error', 225, true],
			['error', 240, true],
			['globalInCatch', 249, false],
			// for-loop header scope
			['index', 277, true],
			['index', 288, true],
			['index', 299, true],
			['loopBody', 316, true],
			['index', 327, true],
			// nested function declaration name binds in the parent function scope
			['inner', 354, true],
			['namedParameter', 360, true],
			// references inside the nested function: module-scope, function-scope
			// (hoisted var) and parameter names are visible; block-scoped names
			// from a sibling block are not.
			['imported', 387, true],
			['top', 398, true],
			['hoisted', 404, true],
			['block', 414, false],
			['blockFunction', 422, false],
			['namedParameter', 438, true],
			// class declaration name binds in the parent (module) scope
			['Declaration', 467, true],
			// static block creates a block scope nested in the class scope
			['staticBlockLocal', 497, true],
			['staticBlockLocal', 517, true],
			// class expression: the name is visible inside the class body...
			['expression', 547, true],
			['NamedExpression', 566, true],
			// method name is a property key, not a declaration
			['method', 585, false],
			['NamedExpression', 605, true],
			// ...but not outside it.
			['NamedExpression', 703, false],
			// named function expression: the name is visible inside the body...
			['fnExpression', 807, true],
			['namedFn', 831, true],
			['namedFn', 851, true],
			// ...but not outside it.
			['namedFn', 863, false],
			// var hoisting across nested functions: a var declared later in the
			// enclosing function is visible from a nested function declared earlier.
			['hoistingHost', 1022, true],
			['readsHoisted', 1049, true],
			['hoistedVar', 1075, true],
			['hoistedVar', 1095, true],
			['readsHoisted', 1115, true],
			// var in a for-loop body is hoisted past the loop's BlockScope to the
			// enclosing function scope and is visible after the loop.
			['loopHoistingHost', 1277, true],
			['i', 1308, true],
			['i', 1315, true],
			['i', 1322, true],
			['loopVar', 1335, true],
			['loopVar', 1355, true],
			// destructuring: only binding identifiers are recorded, not the
			// object keys or the initializer.
			['key', 1443, false],
			['binding', 1448, true],
			['untouched', 1457, true],
			['rest', 1471, true],
			['source', 1480, false],
			['key', 1488, false],
			['binding', 1493, true],
			['untouched', 1502, true],
			['rest', 1513, true],
			['source', 1519, false],
			// a destructuring assignment (not a declaration) does not record
			// bindings.
			['assigned', 1607, false],
			['source', 1620, false],
			['assigned', 1629, false],
			// switch discriminant is evaluated in the surrounding scope; the
			// case-local is only visible inside the switch block.
			['discriminant', 1749, true],
			['discriminant', 1775, true],
			['caseLocal', 1809, true],
			['caseLocal', 1826, true],
			// export specifiers are references, not declarations, but the names
			// resolve to their module-scope declarations.
			['Declaration', 1849, true],
			['expression', 1862, true],
			['fnExpression', 1874, true],
			['hoistingHost', 1888, true],
			['outer', 1902, true]
		]);
	}
});
