let x = 0;

function noEffects () {}

function modifyX () {
	return x++;
}

const a = `${noEffects()}is removed`;

const b = `${globalFunction()}has effects`;

const c = `${modifyX()}has effects`;

const d = noEffects`is removed`;

const e = noEffects`${globalFunction()}has effects`;

const f = noEffects`${modifyX()}has effects`;

const g = globalFunction`has effects`;

const h = (() => {
	console.log( 'effect' );
	return () => {};
})()`has effects`;

const i = modifyX`has effects`;

export { x };
