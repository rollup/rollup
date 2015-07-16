// Emulates a piece of Lodash source code.
// The tag strings are not imported, and a runtime error ensues.

var objTag = '[object Object]';
var arrTag = '[object Array]';
var fnTag = '[object Function]';
var dateTag = '[object Date]';

var strTag = '[object String]';
var numTag = '[object Number]';

// Only the code below is included in the bundle.

var tags = {};

tags[objTag] = tags[arrTag] =
tags[fnTag] = tags[dateTag] = true;

tags[strTag] = tags[numTag] = false;

export default tags;
