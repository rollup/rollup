var foo=(function(exports){'use strict';exports.x = 42;
exports.x+=1;
exports.x=exports.x+1;
exports.x++;
++exports.x;return exports;})({});