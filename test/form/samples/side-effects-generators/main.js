function* noEffects() {
	yield 0;
	let index = 0;
	while(index < 3)
		yield ++index;
}

const iterator1 = noEffects();

function* sideEffectYield() {
	yield globalThis.unknown();
	yield 'no side-effect but must be included to ensure proper control flow';
}

const iterator2 = sideEffectYield();

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

const iterator4 = sideEffectNestedYield();
