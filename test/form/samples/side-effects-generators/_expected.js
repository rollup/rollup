function* sideEffectYield() {
	yield globalThis.unknown();
	yield 'no side-effect but must be included to ensure proper control flow';
}

sideEffectYield();

function* effectCallYield() {
	const yieldedValue = yield;
	yieldedValue();
}

const iterator3 = effectCallYield();
iterator3.next(globalThis.unknown);

function* sideEffectYield2() {
	yield globalThis.unknown();
}

function* sideEffectNestedYield() {
	yield* sideEffectYield2();
}

sideEffectNestedYield();
