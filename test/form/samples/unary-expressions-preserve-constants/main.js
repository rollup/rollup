export const BOB = 3;
export const ALICE = 5;

export function getBob() {
	return {x: BOB, y: -BOB, z: +BOB};
}

export function getAlice() {
	console.log(ALICE);
	return ~ALICE;
}

// Test with different operators
export function testOperators() {
	return {
		negate: -BOB,
		plus: +BOB, 
		not: !BOB,
		bitwise: ~BOB,
		typeof: typeof BOB,
		void: void BOB
	};
}
