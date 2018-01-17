var foo = function () {
	return 42;
};

export default foo;

export function bar () {
	return contrivedExample( foo );
}
