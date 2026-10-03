const value = await Promise.resolve('ok');

var dep = /*#__PURE__*/Object.freeze({
	__proto__: null,
	value: value
});

(async function () {
	const qux = await Promise.resolve().then(function () { return dep; });
	console.log(qux.value);
})();
