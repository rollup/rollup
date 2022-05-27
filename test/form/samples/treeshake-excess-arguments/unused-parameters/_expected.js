function test(a, b, c) {}

function noEffect() {}
test(1, 2, noEffect(), globalThis.unknown());

const testArr = (a, b, c) => {};

function noEffectArr() {}
testArr(1, 2, noEffectArr(), globalThis.unknown());
