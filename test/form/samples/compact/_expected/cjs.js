'use strict';var x=require('external');var self=/*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty(/*#__PURE__*/Object.setPrototypeOf({get default(){return foo}},null),Symbol.toStringTag,{value:'Module'}));console.log(self);
function foo () {
	console.log( x );
}
// trailing comment
module.exports=foo;