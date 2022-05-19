function test(a, b, c) {}
test();

function noEffect() {}
test(1, 2, noEffect(), globalThis.unknown());

const testArr = (a, b, c) => {};
testArr();

function noEffectArr() {}
testArr(1, 2, noEffectArr(), globalThis.unknown());
