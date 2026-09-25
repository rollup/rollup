const a =  await import('./generated-all.js').then(({ nativeA, shimA }) =>
	nativeA ? nativeA : shimA
);
function getThenable() {
	return {
		then(resolve) {
			globalThis.awaitedThenable = true;
			resolve('thenable');
		}
	};
}
await /*#__PURE__*/ getThenable();

console.log(a);
