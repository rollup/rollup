function foo() {
	console.log('dep2');
}

Promise.resolve().then(function () { return dep1; });



var dep1 = /*#__PURE__*/Object.freeze({

});

export { foo as a };
