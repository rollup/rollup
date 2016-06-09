const fooContext = {};

function foo () {
	// inside a function, `this` should be untouched...
	assert.strictEqual( this, fooContext );
}

const bar = () => {
	// ...unless it's an arrow function
	assert.strictEqual( undefined, undefined );
}

foo.call( fooContext );
bar.call( {} );

// outside a function, `this` is undefined
assert.strictEqual( undefined, undefined );
