'use strict';

function* sideEffectYield() {
	yield globalFunction();
	yield 'no side-effect but must be included to ensure proper control flow';
}

const iterator2 = sideEffectYield();

function* effectCallYield() {
	const yieldedValue = yield;
	yieldedValue();
}

const iterator3 = effectCallYield();
iterator3.next(globalFunction);

function* sideEffectYield2() {
	yield globalFunction();
}

function* sideEffectNestedYield() {
	yield* sideEffectYield2();
}

const iterator4 = sideEffectNestedYield();
