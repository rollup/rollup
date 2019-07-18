var mangleMe = "this string should not be inlined".toLowerCase();
export default function () {
	assert.equal( mangleMe, 1 );
}
