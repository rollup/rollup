import './other.js';

var a = 'main';

function paramDefault(a, b = a) {
	assert.equal(b, 'param', 'main-param-b');
}
paramDefault('param');

function outsideDefault(b = a) {
	assert.equal(b, 'main', 'main-outside-b');
}
outsideDefault();

function paramDefaultRedeclare(a, b = a) {
	var a;
	assert.equal(a, 'param', 'main-param-redeclare-a');
	assert.equal(b, 'param', 'main-param-redeclare-b');
}
paramDefaultRedeclare('param');

function outsideDefaultRedeclare(b = a) {
	var a;
	assert.equal(a, undefined, 'main-outside-redeclare-a');
	assert.equal(b, 'main', 'main-outside-redeclare-a');
}
outsideDefaultRedeclare();
