// pure top-level IIFE will be dropped
// @__PURE__ - comment
(function() {
	console.log("iife0");
})();

// pure top-level IIFE assigned to unreferenced var will not be dropped
global.iife1 = /*@__PURE__*/(function() {
	console.log("iife1");
	function iife1() {}
	return iife1;
})();

(function(){
	// pure IIFE in function scope assigned to unreferenced var will be dropped
	var iife2 = /*#__PURE__*/(function() {
		console.log("iife2");
		function iife2() {}
		return iife2;
	})();
})();

// pure top-level calls will be dropped regardless of the leading comments position
var MyClass = /*#__PURE__*//*@class*/(function(){
	function MyClass() {}
	MyClass.prototype.method = function() {};
	return MyClass;
})();

// comment #__PURE__ comment
bar();

// comment #__PURE__ comment
bar(), baz(), quux();
a.b(), /* @__PURE__ */ c.d.e(), f.g();

var x, y;
/* @__PURE__ */(function(){x})(), void/* @__PURE__ */(function(){y})();
/* @__PURE__ */(function(){x})() || true ? foo() : bar();
true || /* @__PURE__ */(function(){y})() ? foo() : bar();
/* @__PURE__ */(function(){x})() && false ? foo() : bar();
false && /* @__PURE__ */(function(){y})() ? foo() : bar();
/* @__PURE__ */(function(){x})() + "foo" ? bar() : baz();
"foo" + /* @__PURE__ */(function(){y})() ? bar() : baz();
/* @__PURE__ */(function(){x})() ? foo() : foo();
[/* @__PURE__ */(function(){x})()] ? foo() : bar();
!{ foo: /* @__PURE__ */(function(){x})() } ? bar() : baz();
