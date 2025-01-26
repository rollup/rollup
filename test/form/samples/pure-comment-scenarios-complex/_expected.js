// pure top-level IIFE will be dropped


// pure top-level IIFE assigned to unreferenced var will not be dropped
global.iife1 = /*@__PURE__*/(function() {
	console.log("iife1");
	function iife1() {}
	return iife1;
})();


baz(), quux();
a.b(), f.g();
foo() ;
foo() ;
bar();
bar();
/* @__PURE__ */(function(){})() + "foo" ? bar() : baz();
"foo" + /* @__PURE__ */(function(){})() ? bar() : baz();
/* @__PURE__ */(function(){})() ? foo() : foo();
foo() ;
baz();
