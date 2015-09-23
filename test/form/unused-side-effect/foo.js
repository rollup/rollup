var uid = 0;
uid = 1;
uid += 1;
uid++;

// ensure identifiers aren't treated as globals just because
// var declaration hasn't been encountered yet...
uid2 = 1;
uid2 += 1;
uid2++;
var uid2;

export var foo = 42;
