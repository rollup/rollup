export var ifA, ifB;
globalThis.condition = false;
if (globalThis.condition) var ifA = 1, ifB = 2;
assert.equal(ifA, undefined);
assert.equal(ifB, undefined);

globalThis.condition = true;
if (globalThis.condition) var ifA = 1, ifB = 2;
assert.equal(ifA, 1);
assert.equal(ifB, 2);

export var elseA, elseB;
globalThis.condition = false;
if (globalThis.condition) {
} else var elseA = 3, elseB = 4;
assert.equal(elseA, 3);
assert.equal(elseB, 4);

export var patternA;
globalThis.condition = true;
if (globalThis.condition) var { patternA } = { patternA: 5 };
assert.equal(patternA, 5);

export var noInitA, noInitB;
if (globalThis.condition) var noInitA, noInitB = 6;
assert.equal(noInitA, undefined);
assert.equal(noInitB, 6);

export var deadBranch = 0;
deadBranch = 1;
if (false) var deadBranch = 2;
assert.equal(deadBranch, 1);

if (false) var plainDead = 2;
assert.equal(plainDead, undefined);

globalThis.effect = () => {};
export var labelA, labelB;
{
	label: var unused = globalThis.effect(), labelA = 1, labelB = 2;
}
assert.equal(labelA, 1);
assert.equal(labelB, 2);
globalThis.effect = undefined;

globalThis.condition = undefined;
