async function hasEffects1 () {
	await globalPromise;
	console.log( 'effect' );
}

hasEffects1();

async function hasEffects2 () {
	await globalFunction();
}

hasEffects2();
