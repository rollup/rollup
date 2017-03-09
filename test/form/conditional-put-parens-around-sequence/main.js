var a = true  ? ( 1, 2, 3 ) : ( 4, 5, 6 );
var b = false ? ( 1, 2, 3 ) : ( 4, 5, 6 );
foo( a, b );

// verify works with no whitespace
bar(true?(1,2):(3,4),false?(5,6):(7,8));
