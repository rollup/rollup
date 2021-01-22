let x = 0;

function noEffects () {}

function modifyX () {
	return x++;
}

`${globalThis.unknown()}has effects`;

`${modifyX()}has effects`;

noEffects`${globalThis.unknown()}has effects`;

noEffects`${modifyX()}has effects`;

globalThis.unknown`has effects`;

(() => {
	console.log( 'effect' );
	return () => {};
})()`has effects`;

modifyX`has effects`;

export { x };
