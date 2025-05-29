const BOB = 3;
const ALICE = 5;

function getBob() {
	return {x: BOB, y: -BOB, z: +BOB};
}

function getAlice() {
	console.log(ALICE);
	return ~ALICE;
}

// Test with different operators
function testOperators() {
	return {
		negate: -BOB,
		plus: +BOB, 
		not: !BOB,
		bitwise: ~BOB,
		typeof: typeof BOB,
		void: void BOB
	};
}

export { ALICE, BOB, getAlice, getBob, testOperators };
