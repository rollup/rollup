System.register('foo',['external'],(function(exports){'use strict';var x;return{setters:[function(module){x=module.default;}],execute:(function(){exports("default",foo);var self=/*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({__proto__:null,get default(){return foo}},Symbol.toStringTag,{value:'Module'}));console.log(self);
function foo () {
	console.log( x );
}
// trailing comment
})}}));