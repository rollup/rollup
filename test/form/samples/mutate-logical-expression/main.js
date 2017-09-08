var a = {};
var logicalA = a || true;
logicalA.bar = 1;

var aExp = {};
var logicalAExp = aExp || true;
logicalAExp.bar = 1;

export {aExp}

var b = {};
var logicalB = true || b;
logicalB.bar = 1;

var bExp = {};
var logicalBExp = true || bExp;
logicalBExp.bar = 1;

export {bExp}

var c = {};
var logicalC = false || c;
logicalC.bar = 1;

var cExp = {};
var logicalCExp = false || cExp;
logicalCExp.bar = 1;

export {cExp}

var d = {};
var logicalD = true && d;
logicalD.bar = 1;

var dExp = {};
var logicalDExp = true && dExp;
logicalDExp.bar = 1;

export {dExp}

var e = {};
var logicalE = false && e;
logicalE.bar = 1;

var eExp = {};
var logicalEExp = false && eExp;
logicalEExp.bar = 1;

export {eExp}
