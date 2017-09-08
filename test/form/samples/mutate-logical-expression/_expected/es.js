var aExp = {};
var logicalAExp = aExp || true;
logicalAExp.bar = 1;

var bExp = {};
var cExp = {};
var logicalCExp = false || cExp;
logicalCExp.bar = 1;

var dExp = {};
var logicalDExp = true && dExp;
logicalDExp.bar = 1;

var eExp = {};

export { aExp, bExp, cExp, dExp, eExp };
