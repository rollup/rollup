export var a, c;
for (var a = 1, c = 2; a < 3; a++) {}
assert.equal(a, 3);
assert.equal(c, 2);

export var unusedCase;
for (var unused = 10, unusedCase = 2; unusedCase < 3; unusedCase++) {}
assert.equal(unused, 10);
assert.equal(unusedCase, 3);

export var noInitA, noInitB;
for (var noInitA, noInitB = 2; noInitB < 3; noInitB++) {}
assert.equal(noInitA, undefined);
assert.equal(noInitB, 3);

export var forOfA, forOfB;
for (const value of [1, 2]) var forOfA = value, forOfB = value;
assert.equal(forOfA, 2);
assert.equal(forOfB, 2);

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

export var catchA = 0;
catchA = 1;
try {
	throw 0;
} catch (catchA) {
	{
		var catchA = 1;
		for (var catchA = 0, catchIndex = 0; catchIndex < 1; catchIndex++);
	}
}
assert.equal(catchA, 1);

export var catchB = 0;
catchB = 1;
try {
	throw 0;
} catch (catchB) {
	{
		var catchB = 1;
		for (const value of [1]) var catchB = value, k = value;
	}
}
assert.equal(catchB, 1);
