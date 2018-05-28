const x = {
	a() {},
	a() {
		triggeredX = true;
	}
};
let triggeredX = false;
x.a();
assert.ok(triggeredX);

const y = {
	a() {
		triggeredY = true;
	},
	[unknownB]() {}
};
let triggeredY = false;
y.a();
assert.ok(triggeredY);

const z = {
	a() {},
	[unknownA]() {
		triggeredZ = true;
	}
};
let triggeredZ = false;
z.a();
assert.ok(triggeredZ);
