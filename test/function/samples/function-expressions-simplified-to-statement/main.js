var value;

// conditional expression
function foo(){
	value = 'foo';
}

true ? function foo(x){
	value = x;
}("consequent") : 2;

assert.strictEqual(value, 'consequent');

foo("incorrect");

assert.strictEqual(value, 'foo');

false ? null: function foo(x){
	value = x;
}("alternate");

assert.strictEqual(value, 'alternate');

// logical expression
function bar(){
	value = 'bar';
}

true && function bar(x){
	value = x;
}("and");

assert.strictEqual(value, 'and');

bar("incorrect");

assert.strictEqual(value, 'bar');

false || function bar(x){
	value = x;
}("or");

assert.strictEqual(value, 'or');

// sequence expression
function baz(){
	value = 'baz';
}

0, function baz(x){
	value = x;
}("comma");
assert.strictEqual(value, 'comma');

baz("incorrect");

assert.strictEqual(value, 'baz');
