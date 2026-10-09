console.log('x' );

// Returning different variables stays conservative
const first = { a: 1 };
const second = { a: 2 };

function getDifferent(condition) {
	if (condition) return first;
	return second;
}

console.log(getDifferent(globalThis.condition).a ? 'x' : 'y');

// Returning a variable declared later stays conservative
function getTdz(condition) {
	if (condition) return later;
	let later = { a: 1 };
	return later;
}

console.log(getTdz(globalThis.condition).a ? 'x' : 'y');

// Returning a hoisted variable stays conservative
function getHoisted(condition) {
	if (condition) return hoisted;
	var hoisted = { a: 1 };
	return hoisted;
}

console.log(getHoisted(globalThis.condition).a ? 'x' : 'y');

// Returning a variable that is the target of an assignment stays conservative
// so that lazy initializations are not resolved to the declaration value; the
// decision is variable-wide, wherever the assignment happens
var useSymbolAsUid;

function requireUseSymbolAsUid(condition) {
	if (condition) return useSymbolAsUid;
	useSymbolAsUid = globalThis.symbolDetection;
	return useSymbolAsUid;
}

console.log(/*@__PURE__*/ requireUseSymbolAsUid(globalThis.condition) ? 'detected' : 'not detected');

// This also holds when the assignment happens in a different function
var lazyInit;

function initLazy() {
	lazyInit = globalThis.initialValue;
}

function getLazy(condition) {
	if (condition) return lazyInit;
	initLazy();
	return lazyInit;
}

console.log(/*@__PURE__*/ getLazy(globalThis.condition) ? 'initialized' : 'not initialized');

console.log('truthy' );

// Destructuring assignments to the returned variable are tracked as well
var destructuredArray;

function getDestructuredArray(condition) {
	if (condition) return destructuredArray;
	[, ...destructuredArray] = globalThis.initialValues;
	return destructuredArray;
}

console.log(
	/*@__PURE__*/ getDestructuredArray(globalThis.condition) ? 'initialized' : 'not initialized'
);

var destructuredObject;

function getDestructuredObject(condition) {
	if (condition) return destructuredObject;
	({ destructured: destructuredObject = 'default value' } = globalThis.initialValues);
	return destructuredObject;
}

console.log(
	/*@__PURE__*/ getDestructuredObject(globalThis.condition) ? 'initialized' : 'not initialized'
);

// A single return of an assigned variable is not resolved to its initial value
var lazySingleton;

function getLazySingleton() {
	if (!lazySingleton) lazySingleton = globalThis.initialValue;
	return lazySingleton;
}

console.log(/*@__PURE__*/ getLazySingleton() ? 'initialized' : 'not initialized');

console.log('truthy' );

// A single return of a variable that is only assigned from unused code is still
// not resolved to its initial value
let deadSetterFlag = false;

function isDeadSetterFlag() {
	return deadSetterFlag;
}

if (isDeadSetterFlag()) console.log('dead setter ran');

// The same is true when a variable is returned by an arrow function
var arrowTarget;

const getArrowTarget = () => arrowTarget;

console.log(/*@__PURE__*/ getArrowTarget() ? 'initialized' : 'not initialized');
