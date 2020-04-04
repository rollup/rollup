System.register('foo',['external'],function(exports){'use strict';var x;return{setters:[function(module){x=module.default;}],execute:function(){exports('default',foo);var self=/*#__PURE__*/Object.freeze({__proto__:null,[Symbol.toStringTag]:'Module',get default(){return foo}});console.log(self);
function foo () {
	console.log( x );
}
// trailing comment
}}});