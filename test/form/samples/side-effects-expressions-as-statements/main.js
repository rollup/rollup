// Access getters with side-effects to e.g. force DOM repaints
globalVar.getter;
globalVar && globalVar.member && globalVar.member.getter;

// Call pure constructors for side-effects for e.g. feature detection
new Function('');

var localVarsAreRemoved;
localVarsAreRemoved;
