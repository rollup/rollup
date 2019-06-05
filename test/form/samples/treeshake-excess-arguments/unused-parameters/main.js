function test(a, b = global(), c) {}

const someStuff = {x: 1};
test(1, 2, 3, someStuff);

function noEffect() {}
test(1, 2, noEffect(), global());

const testArr = (a, b = global(), c) => {}

const someStuffArr = {x: 1};
testArr(1, 2, 3, someStuffArr);

function noEffectArr() {}
testArr(1, 2, noEffectArr(), global());
