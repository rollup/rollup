// The problem is that with moduleSideEffects: false, the TDZ detection logic
// fails here and assumes that InjectFlags is truthy in its initializer. While
// this construct is questionable, the correct solution should be to detect
// this case even in modules without side effects. For now, the simpler solution
// is to turn off handling the return value of the IIFE as truthy.
var InjectFlags = /* @__PURE__ */ (function (InjectFlags2) {
	InjectFlags2[(InjectFlags2['Default'] = 0)] = 'Default';
	return InjectFlags2;
})(InjectFlags || {});

export const value = InjectFlags.Default;

