'use strict';function _interopDefault(e){return(e&&(typeof e==='object')&&'default'in e)?e['default']:e}var x=_interopDefault(require('external'));var self=/*#__PURE__*/Object.freeze({[Symbol.toStringTag]:'Module',get default(){return foo}});console.log(self);
function foo () {
	console.log( x );
}
// trailing comment
module.exports=foo;