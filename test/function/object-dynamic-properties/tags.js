// Emulates a piece of Lodash source code.
// The tag strings are not imported, and a runtime error ensues.

let objTag = '[object Object]';
let arrTag = '[object Array]';
let fnTag = '[object Function]';
let dateTag = '[object Date]';

let strTag = '[object String]';
let numTag = '[object Number]';

// Only the code below is included in the bundle.

var tags = {};

tags[objTag] = tags[arrTag] =
tags[fnTag] = tags[dateTag] = true;

tags[strTag] = tags[numTag] = false;

export default tags;
