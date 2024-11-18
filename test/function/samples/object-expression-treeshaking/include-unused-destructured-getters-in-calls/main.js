const effects1 = [];
function test1({ x1 }) {}
test1({
	get x1() {
		effects1.push('x1');
	},
	get y1() {
		effects1.push('y1');
	}
});
assert.deepStrictEqual(effects1, ['x1'], 'effects1');

const effects2 = [];
function test2({ x2: { y2 } }) {}
test2({
	x2: {
		get y2() {
			effects2.push('y2');
		}
	}
});
assert.deepStrictEqual(effects2, ['y2'], 'effects2');

const effects3 = [];
function test3( { x3, ...rest3 }){}
test3({
	get x3() {
		effects3.push('x3');
	},
	get y3() {
		effects3.push('y3');
	}
});
assert.deepStrictEqual(effects3, ['x3', 'y3'], 'effects3');
