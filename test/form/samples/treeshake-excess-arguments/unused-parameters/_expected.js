function test(a, b = global(), c) {}
test(1, 2);

function noEffect() {}
test(1, 2, noEffect(), global());

const testArr = (a, b = global(), c) => {};
testArr(1, 2);

function noEffectArr() {}
testArr(1, 2, noEffectArr(), global());
