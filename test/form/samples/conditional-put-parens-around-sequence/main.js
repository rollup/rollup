var a = true  ? ( 1, foo(), 3 ) : ( 4, bar(), 6 );
var b = false ? ( 1, foo(), 3 ) : ( 4, bar(), 6 );
foo( a, b );

// verify works with no whitespace
bar(true?(foo(),2):(bar(),4),false?(foo(),6):(bar(),8));
