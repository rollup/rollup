setTimeout(() => {
	console.log(main);
});

const square$1 = x => x;

var lib = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
	square: square$1
}, null));

const { square } = await Promise.resolve().then(function () { return lib; });

console.log(square(5));

const main = 'main';

export { main };
