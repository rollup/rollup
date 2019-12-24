// Access getters with side-effects to e.g. force DOM repaints
globalThis.unknown.getter;
globalThis.unknown && globalThis.unknown.member && globalThis.unknown.member.getter;

// Call pure constructors for side-effects for e.g. feature detection
new Function('');

var localVarsAreRemoved;
localVarsAreRemoved;
