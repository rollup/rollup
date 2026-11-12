export var forOfA, forOfB;
for (const value of [1, 2]) var forOfA = value, forOfB = value * 2;
assert.equal(forOfA, 2);
assert.equal(forOfB, 4);

export var forInA, forInB;
for (const key in { x: 1, y: 2 }) var forInA = key, forInB = key;
assert.equal(forInA, 'y');
assert.equal(forInB, 'y');

export var classicA, classicB;
for (let i = 0; i < 2; i++) var classicA = i, classicB = i;
assert.equal(classicA, 1);
assert.equal(classicB, 1);

export var whileA, whileB;
let i = 0;
while (i < 2) var whileA = i, whileB = ++i;
assert.equal(whileA, 1);
assert.equal(whileB, 2);

export var doA, doB;
let j = 0;
do var doA = j, doB = j;
while (++j < 2);
assert.equal(doA, 1);
assert.equal(doB, 1);

export var patternA, patternB;
for (const value of [3]) var { patternA, patternB } = { patternA: value, patternB: value };
assert.equal(patternA, 3);
assert.equal(patternB, 3);

export var trailingPattern, wrappedLast;
for (const value of [5])
	var { trailingPattern } = { trailingPattern: value },
		wrappedLast = value /* last */;
assert.equal(trailingPattern, 5);
assert.equal(wrappedLast, 5);
