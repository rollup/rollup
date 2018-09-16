var a = 'other';

function paramDefault(a, b = a) {
	assert.equal(b, 'param', 'other-param-b');
}
paramDefault('param');

function outsideDefault(b = a) {
	assert.equal(b, 'other', 'other-outside-b');
}
outsideDefault();

function paramDefaultRedeclare(a, b = a) {
	var a;
	assert.equal(a, 'param', 'other-param-redeclare-a');
	assert.equal(b, 'param', 'other-param-redeclare-b');
}
paramDefaultRedeclare('param');

function outsideDefaultRedeclare(b = a) {
	var a;
	assert.equal(a, undefined, 'other-outside-redeclare-a');
	assert.equal(b, 'other', 'other-outside-redeclare-a');
}
outsideDefaultRedeclare();
