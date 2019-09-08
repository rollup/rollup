async function hasEffects1 () {
	await globalThis.unknown;
	console.log( 'effect' );
}

hasEffects1();

async function hasEffects2 () {
	await globalThis.unknown();
}

hasEffects2();

async function isRemoved () {
	await globalThis.unknown;
}

isRemoved();

