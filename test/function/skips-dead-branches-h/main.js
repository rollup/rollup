var a = 3;
var b = 4;
var c = true ? a === 3 ? a : b : a;
var d = false ? a !== 4 ? b : a : b;

console.log( c + d );
