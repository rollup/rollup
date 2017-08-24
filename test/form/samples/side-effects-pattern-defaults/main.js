var { x: a = 1 } = {};

var { x: b = globalFunction() } = {};

var c;
({ x: c = 1 } = {});

var d;
({ x: d = globalFunction() } = {});

var [ e = 1 ] = [];

var [ f = globalFunction() ] = [];

var g;
[ g = 1 ] = [];

var h;
[ h = globalFunction() ] = [];
