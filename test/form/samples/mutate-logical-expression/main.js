var a = {};
var logicalA = a || {};
logicalA.bar = 1;

var aExp = {};
var logicalAExp = aExp || {};
logicalAExp.bar = 1;

export {aExp}

var b = {};
var logicalB = false || b;
logicalB.bar = 1;

var bExp = {};
var logicalBExp = false || bExp;
logicalBExp.bar = 1;

export {bExp}

var c = {};
var logicalC = true && c;
logicalC.bar = 1;

var cExp = {};
var logicalCExp = true && cExp;
logicalCExp.bar = 1;

export {cExp}
