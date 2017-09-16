(function UnusedFunctionExpression() {});
(class UnusedClassExpression {});
var UnusedClassExpression = class UnusedClassExpression {};
var unusedVar;
let unusedLet;
const unusedConst = 1;

function foo() {
	(function UnusedFunctionExpression() {});
	(class UnusedClassExpression {});
	var UnusedClassExpression = class UnusedClassExpression {};
	var unusedVar;
	let unusedLet;
	const unusedConst = 1;
	console.log("foo");
}

foo();
