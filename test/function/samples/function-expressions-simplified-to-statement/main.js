var value;

// conditional expression
function foo(){
	value = 'foo';
}

true ? function foo(x){
	value = x;
}("consequent") : 2;

assert.equal(value, 'consequent');

foo("incorrect");

assert.equal(value, 'foo');

false ? null: function foo(x){
	value = x;
}("alternate");

assert.equal(value, 'alternate');

// logical expression
function bar(){
	value = 'bar';
}

true && function bar(x){
	value = x;
}("and");

assert.equal(value, 'and');

bar("incorrect");

assert.equal(value, 'bar');

false || function bar(x){
	value = x;
}("or");

assert.equal(value, 'or');

// sequence expression
function baz(){
	value = 'baz';
}

0, function baz(x){
	value = x;
}("comma");

assert.equal(value, 'comma');

baz("incorrect");

assert.equal(value, 'baz');
