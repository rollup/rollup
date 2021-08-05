export const {a = 1, ...b} = global1, c = global2, {d} = global3;
export const [e, ...f] = global4;
export const {g, x: h = 2, y: {z: i}, a: [j ,k,, l]} = global5;

export var m = 1;
var {m} = global6;

null, {m} = global7;
