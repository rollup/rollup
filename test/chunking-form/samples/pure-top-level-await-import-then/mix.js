export const a = /*#__PURE__*/ await import('./all.js').then(({ nativeA, shimA }) =>
	nativeA ? nativeA : shimA
);
export const b = /*#__PURE__*/ await import('./all.js').then(({ nativeB, shimB }) =>
	nativeB ? nativeB : shimB
);
function getThenable() {
	return {
		then(resolve) {
			globalThis.awaitedThenable = true;
			resolve('thenable');
		}
	};
}
export const c = await /*#__PURE__*/ getThenable();
