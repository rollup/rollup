System.register('foo',['external'],function(exports){'use strict';var x;return{setters:[function(module){x=module.default;}],execute:function(){exports('default',foo);var self=/*#__PURE__*/Object.freeze({[Symbol.toStringTag]:'Module',__proto__:null,get default(){return foo}});console.log(self);
function foo () {
	console.log( x );
}
// trailing comment
}}});