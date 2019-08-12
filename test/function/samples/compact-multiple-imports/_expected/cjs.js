'use strict';function _interopDefault(e){return(e&&(typeof e==='object')&&'default'in e)?e['default']:e}var x=_interopDefault(require('external'));var self = {get default(){return foo}};if(typeof Symbol!=='undefined'&&Symbol.toStringTag)Object.defineProperty(self,Symbol.toStringTag,{value:'Module'});else Object.defineProperty(self,'toString',{value:function(){return'[object Module]';}});/*#__PURE__*/Object.freeze(self);console.log(self);
function foo () {
	console.log( x );
}
// trailing comment
module.exports=foo;
