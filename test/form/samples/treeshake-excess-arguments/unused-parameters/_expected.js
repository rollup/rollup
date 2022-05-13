function test(a, b, c) {}
test(1, 2);

function noEffect() {}
test(1, 2, noEffect(), globalThis.unknown());

const testArr = (a, b, c) => {};
testArr(1, 2);

function noEffectArr() {}
testArr(1, 2, noEffectArr(), globalThis.unknown());
