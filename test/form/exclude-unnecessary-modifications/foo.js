var foo = {};

mutate1( foo );

// should be included
[ 'a', 'b', 'c' ].forEach( function ( letter, i ) {
	foo[ letter ] = i;
});

[ 'd', 'e', 'f' ].forEach( ( letter, i ) => {
	foo[ letter ] = i;
});

function mutate1 ( obj ) {
	obj.mutated = 1;
}

// should be excluded
var mutate2 = function () {
	foo.mutated = 2;
}

function unused1 () {
	foo.wat = 'nope';
}

function unused2 () {
	mutate1( foo );
}

var obj1 = {
	mutate3 () { foo.mutated = 3; }
};

var obj2 = {
	mutate4: function () { foo.mutated = 4; }
};

var obj3 = {
	mutate5: () => foo.mutated = 5
};

class Mutator {
	mutate6 () {
		foo.mutated = 6;
	}
}

export default foo;
