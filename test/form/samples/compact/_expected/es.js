import x from'external';var self=/*#__PURE__*/Object.freeze({[Symbol.toStringTag]:'Module',__proto__:null,get default(){return foo}});console.log(self);
function foo () {
	console.log( x );
}
// trailing comment
export default foo;