const condition = globalThis.condition;

function visit() {
	if (condition) return firstHandler();
	return secondHandler();
}

function firstHandler() {
	if (condition) return () => visit();
	return () => visit();
}

function secondHandler() {
	if (condition) return () => visit();
	return () => visit();
}

if (visit()()()()()()()()()()()) console.log('retained');
